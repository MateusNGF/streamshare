"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { SubscriptionService } from "@/services/subscription.service";
import { StreamingService } from "@/services/streaming.service";
import { InviteService } from "@/services/invite.service";
import { StatusConvite, TipoNotificacao } from "@prisma/client";

/**
 * Usuário solicita entrada em um streaming público via Explorer.
 */
export async function requestParticipation(streamingId: number) {
    try {
        const { userId } = await getContext();

        // 1. Validar streaming e capacidade
        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId, isAtivo: true },
            include: {
                conta: true,
                catalogo: true,
            }
        });

        if (!streaming) return { success: false, error: "Streaming não encontrado." };

        // Centralized spot validation
        await StreamingService.ensureCapacity(streamingId);

        const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario) return { success: false, error: "Usuário não encontrado." };

        // 2. Verificar duplicidade (solicitação pendente)
        const solicitacaoExistente = await prisma.convite.findFirst({
            where: {
                contaId: streaming.contaId,
                usuarioId: userId,
                streamingId,
                status: StatusConvite.solicitado
            }
        });

        if (solicitacaoExistente) {
            return { success: false, error: "Você já tem uma solicitação pendente para este serviço." };
        }

        // 3. Verificar se já é participante ativo
        const assinaturaAtiva = await prisma.assinatura.findFirst({
            where: {
                streamingId,
                participante: { userId },
                status: { in: ["ativa", "suspensa"] }
            }
        });

        if (assinaturaAtiva) {
            return { success: false, error: "Você já possui uma assinatura ativa para este serviço." };
        }

        // 4. Se o streaming estiver configurado para auto-aprovação
        if (streaming.autoAprovarSolicitacoes) {
            const result = await prisma.$transaction(async (tx) => {
                // Vincular Participante
                const participante = await tx.participante.upsert({
                    where: {
                        contaId_userId: { contaId: streaming.contaId, userId }
                    },
                    create: {
                        contaId: streaming.contaId,
                        userId,
                        nome: usuario.nome,
                        email: usuario.email,
                        status: "ativo"
                    },
                    update: {
                        status: "ativo",
                        deletedAt: null
                    }
                });

                // Criar assinatura
                const assinatura = await SubscriptionService.createFromStreaming(tx, participante.id, streamingId);

                // Notificações
                await tx.notificacao.create({
                    data: {
                        contaId: streaming.contaId,
                        usuarioId: null,
                        tipo: TipoNotificacao.participante_criado,
                        titulo: "Entrada Automática",
                        descricao: `${usuario.nome} entrou no streaming ${streaming.apelido || streaming.catalogo.nome} via aprovação automática (Configurado pelo Organizador).`,
                        metadata: { participanteId: participante.id, assinaturaId: assinatura.id }
                    }
                });

                // Gerenciar lotação
                await InviteService.handleStreamingFull(streamingId, tx);

                return { success: true, isAutoApproved: true, data: assinatura };
            });

            revalidatePath("/explore");
            revalidatePath("/assinaturas");
            return result;
        }

        // 5. Caso contrário, criar a Solicitação com validade de 48h (conforme UX)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        const solicitacao = await prisma.convite.create({
            data: {
                email: usuario.email,
                contaId: streaming.contaId,
                streamingId,
                status: StatusConvite.solicitado,
                usuarioId: userId,
                expiresAt,
            }
        });

        // 6. Notificar Admins (Fluxo manual)
        const admins = await prisma.contaUsuario.findMany({
            where: { contaId: streaming.contaId, nivelAcesso: { in: ["owner", "admin"] } },
            select: { usuarioId: true }
        });

        for (const admin of admins) {
            await prisma.notificacao.create({
                data: {
                    contaId: streaming.contaId,
                    usuarioId: null, // Broadcast
                    tipo: TipoNotificacao.solicitacao_participacao_criada,
                    titulo: "Nova solicitação de entrada",
                    descricao: `${usuario.nome} solicitou entrada no streaming ${streaming.apelido || streaming.catalogo.nome}. Aprovação manual pendente.`,
                    metadata: {
                        conviteId: solicitacao.id,
                        streamingId,
                        usuarioId: userId
                    }
                }
            });
        }

        revalidatePath("/explore");
        return { success: true, data: solicitacao };
    } catch (error: any) {
        console.error("[REQUEST_PARTICIPATION_ERROR]", error);
        return { success: false, error: error.message || "Erro ao solicitar participação" };
    }
}

/**
 * Aprova uma solicitação de participação vinda do Explorer.
 */
export async function approveRequest(conviteId: string) {
    try {
        const { contaId } = await getContext();

        const solicitacao = await prisma.convite.findFirst({
            where: {
                id: conviteId,
                contaId,
                status: StatusConvite.solicitado,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            include: { usuario: true, streaming: { include: { catalogo: true } } }
        });

        if (!solicitacao || !solicitacao.usuario || !solicitacao.streamingId) {
            return { success: false, error: "Solicitação não encontrada, inválida ou expirada." };
        }

        const streamingId = solicitacao.streamingId;

        // Validar capacidade via Service
        await StreamingService.ensureCapacity(streamingId);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Marcar convite como aceito
            await tx.convite.update({
                where: { id: conviteId },
                data: { status: StatusConvite.aceito }
            });

            // 2. Vincular Participante
            const participante = await tx.participante.upsert({
                where: {
                    contaId_userId: { contaId, userId: solicitacao.usuarioId! }
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

            // 4. Notificações
            await Promise.all([
                tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: solicitacao.usuarioId!,
                        tipo: TipoNotificacao.solicitacao_participacao_aceita,
                        titulo: "Sua solicitação foi aprovada!",
                        descricao: `Você agora faz parte do streaming ${solicitacao.streaming?.apelido || solicitacao.streaming?.catalogo.nome}.`,
                        metadata: { assinaturaId: assinatura.id }
                    }
                }),
                tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: null,
                        tipo: TipoNotificacao.participante_criado,
                        titulo: "Solicitação Aprovada",
                        descricao: `${solicitacao.usuario!.nome} foi aprovado pelo Organizador e agora é um participante ativo.`,
                        metadata: { participanteId: participante.id }
                    }
                })
            ]);

            // 5. Gerenciar lotação (Side effect delegating complex logic)
            await InviteService.handleStreamingFull(streamingId, tx);

            return { success: true, data: assinatura };
        });

        revalidatePath("/participantes");
        revalidatePath("/assinaturas");
        return result;
    } catch (error: any) {
        console.error("[APPROVE_REQUEST_ERROR]", error);
        return { success: false, error: error.message || "Erro ao aprovar solicitação" };
    }
}

/**
 * Rejeita uma solicitação de participação.
 */
export async function rejectRequest(conviteId: string) {
    try {
        const { contaId } = await getContext();

        const solicitacao = await prisma.convite.update({
            where: { id: conviteId, contaId, status: StatusConvite.solicitado },
            data: { status: StatusConvite.recusado }
        });

        if (solicitacao.usuarioId) {
            await prisma.notificacao.create({
                data: {
                    contaId,
                    usuarioId: solicitacao.usuarioId,
                    tipo: TipoNotificacao.solicitacao_participacao_recusada,
                    titulo: "Solicitação recusada",
                    descricao: `Infelizmente sua solicitação para entrar no streaming foi recusada pelo Organizador.`,
                }
            });
        }

        revalidatePath("/participantes");
        return { success: true };
    } catch (error: any) {
        console.error("[REJECT_REQUEST_ERROR]", error);
        return { success: false, error: "Erro ao rejeitar solicitação" };
    }
}

/**
 * Lista solicitações pendentes para a conta.
 */
export async function getPendingRequests() {
    try {
        const { contaId } = await getContext();

        const data = await prisma.convite.findMany({
            where: {
                contaId,
                status: StatusConvite.solicitado,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            include: {
                usuario: { select: { nome: true, email: true } },
                streaming: { include: { catalogo: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PENDING_REQUESTS_ERROR]", error);
        return { success: false, error: "Erro ao buscar solicitações pendentes" };
    }
}
