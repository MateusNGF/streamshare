"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { SubscriptionService } from "@/services/subscription.service";

/**
 * Usuário solicita entrada em um streaming público via Explorer
 * Agora cria um registro na tabela de CONVITE com status 'solicitado'
 */
export async function requestParticipation(streamingId: number) {
    const { userId } = await getContext();

    // 1. Validar streaming
    const streaming = await prisma.streaming.findUnique({
        where: { id: streamingId, isAtivo: true },
        include: {
            conta: true,
            catalogo: true,
            _count: { select: { assinaturas: { where: { status: { in: ["ativa", "suspensa"] } } } } }
        }
    });

    if (!streaming) {
        throw new Error("Streaming não encontrado.");
    }

    // 2. Verificar se há vagas
    if (streaming._count.assinaturas >= streaming.limiteParticipantes) {
        throw new Error("Não há vagas disponíveis para este streaming no momento.");
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new Error("Usuário não encontrado.");

    // 3. Verificar se já existe uma solicitação pendente para este serviço exato
    const solicitacaoExistente = await prisma.convite.findFirst({
        where: {
            contaId: streaming.contaId,
            usuarioId: userId,
            streamingId,
            status: "solicitado"
        }
    });

    if (solicitacaoExistente) {
        throw new Error("Você já tem uma solicitação pendente para este serviço.");
    }

    // 4. Verificar se já é participante ativo deste streaming
    const assinaturaAtiva = await prisma.assinatura.findFirst({
        where: {
            streamingId,
            participante: {
                userId
            },
            status: { in: ["ativa", "suspensa"] }
        }
    });

    if (assinaturaAtiva) {
        throw new Error("Você já possui uma assinatura ativa para este serviço.");
    }

    // 5. Criar o registro de "Solicitação" (Convite do tipo solicitado)
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias para o admin aprovar

    const solicitacao = await prisma.convite.create({
        data: {
            email: usuario.email,
            contaId: streaming.contaId,
            streamingId,
            status: "solicitado",
            token,
            expiresAt,
            usuarioId: userId,
            // convidadoPorId é null pois é uma solicitação
        }
    });

    // 6. Notificar Admins da Conta
    const admins = await prisma.contaUsuario.findMany({
        where: { contaId: streaming.contaId, nivelAcesso: { in: ["owner", "admin"] } },
        select: { usuarioId: true }
    });

    for (const admin of admins) {
        await prisma.notificacao.create({
            data: {
                contaId: streaming.contaId,
                usuarioId: null, // Broadcast para todos os Admins (conforme NOTIFICATIONS.md)
                tipo: "solicitacao_participacao_criada",
                titulo: "Nova solicitação de entrada",
                descricao: `${usuario.nome} solicitou entrada no streaming ${streaming.apelido || streaming.catalogo.nome}.`,
                metadata: {
                    conviteId: solicitacao.id,
                    streamingId,
                    usuarioId: userId
                }
            }
        });
    }

    revalidatePath("/explore");
    return solicitacao;
}

/**
 * Aprova uma solicitação de participação vinda do Explorer
 * Converte o Convite 'solicitado' em Participante Ativo + Assinatura
 */
export async function approveRequest(conviteId: string) {
    const { contaId } = await getContext();

    const solicitacao = await prisma.convite.findFirst({
        where: { id: conviteId, contaId, status: "solicitado" },
        include: { usuario: true, streaming: { include: { catalogo: true } } }
    });

    if (!solicitacao || !solicitacao.usuario || !solicitacao.streamingId) {
        throw new Error("Solicitação não encontrada ou inválida.");
    }

    const streamingId = solicitacao.streamingId;

    // Validar vaga novamente
    const streaming = await prisma.streaming.findUnique({
        where: { id: streamingId },
        include: { _count: { select: { assinaturas: { where: { status: { in: ["ativa", "suspensa"] } } } } } }
    });

    if (!streaming || streaming._count.assinaturas >= streaming.limiteParticipantes) {
        throw new Error("Não há vagas disponíveis neste streaming atualmente.");
    }

    const result = await prisma.$transaction(async (tx) => {
        // 1. Marcar convite como aceito
        await tx.convite.update({
            where: { id: conviteId },
            data: { status: "aceito" }
        });

        // 2. Criar/Vincular Participante (garantindo que não esteja deletado)
        const participante = await tx.participante.upsert({
            where: {
                contaId_userId: {
                    contaId,
                    userId: solicitacao.usuarioId!
                }
            },
            create: {
                contaId,
                userId: solicitacao.usuarioId!,
                nome: solicitacao.usuario!.nome,
                email: solicitacao.email,
                status: "ativo"
            },
            update: {
                status: "ativo",
                deletedAt: null
            }
        });

        // 3. Criar assinatura
        const assinatura = await SubscriptionService.createFromStreaming(tx, participante.id, streamingId);

        // 4. Notificar Usuário (Direct Target)
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: solicitacao.usuarioId!,
                tipo: "solicitacao_participacao_aceita",
                titulo: "Sua solicitação foi aprovada!",
                descricao: `Você agora faz parte do streaming ${solicitacao.streaming?.apelido || solicitacao.streaming?.catalogo.nome}.`,
                metadata: {
                    assinaturaId: assinatura.id
                }
            }
        });

        // 5. Notificar Admins (Account Broadcast)
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: null,
                tipo: "participante_criado",
                titulo: "Solicitação Aprovada",
                descricao: `${solicitacao.usuario!.nome} foi aprovado e agora é um participante ativo.`,
                metadata: { participanteId: participante.id }
            }
        });

        return assinatura;
    });

    revalidatePath("/participantes");
    revalidatePath("/assinaturas");
    return result;
}

/**
 * Rejeita uma solicitação de participação
 */
export async function rejectRequest(conviteId: string) {
    const { contaId } = await getContext();

    await prisma.convite.update({
        where: { id: conviteId, contaId, status: "solicitado" },
        data: { status: "recusado" }
    });

    // Buscar dados para notificação
    const solicitacao = await prisma.convite.findUnique({
        where: { id: conviteId },
        select: { usuarioId: true }
    });

    if (solicitacao?.usuarioId) {
        await prisma.notificacao.create({
            data: {
                contaId,
                usuarioId: solicitacao.usuarioId,
                tipo: "solicitacao_participacao_recusada",
                titulo: "Solicitação recusada",
                descricao: `Infelizmente sua solicitação para entrar no streaming foi recusada pelo administrador.`,
            }
        });
    }

    revalidatePath("/participantes");
}

/**
 * Lista solicitações pendentes para a conta (obtidas da tabela de Convite)
 */
export async function getPendingRequests() {
    const { contaId } = await getContext();

    return prisma.convite.findMany({
        where: {
            contaId,
            status: "solicitado"
        },
        include: {
            usuario: {
                select: { nome: true, email: true }
            },
            streaming: {
                include: {
                    catalogo: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}
