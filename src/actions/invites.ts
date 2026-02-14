"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { TipoNotificacao } from "@prisma/client";

/**
 * Convidar usuário via email
 */
export async function inviteUser(data: {
    email: string;
    streamingId?: number;
}) {
    const { contaId, userId: convidadoPorId } = await getContext();
    const emailFormatted = data.email.toLowerCase().trim();

    // 1. Validar email
    if (!data.email) {
        throw new Error("Email é obrigatório");
    }

    // 1.5. Validar se o usuário não está convidando a si mesmo
    const currentUser = await prisma.usuario.findUnique({
        where: { id: convidadoPorId },
        select: { email: true }
    });

    if (currentUser?.email.toLowerCase() === emailFormatted) {
        throw new Error("Você não pode convidar a si mesmo.");
    }

    // 2. Verificar se já existe como participante ativo na conta
    const participanteExistente = await prisma.participante.findFirst({
        where: {
            contaId,
            email: emailFormatted,
            status: "ativo"
        }
    });

    if (participanteExistente) {
        throw new Error("Este usuário já é um participante ativo nesta conta.");
    }

    // 3. Verificar convite pendente existente
    const convitePendente = await prisma.convite.findFirst({
        where: {
            contaId,
            email: emailFormatted,
            status: "pendente",
            expiresAt: { gt: new Date() }
        }
    });

    if (convitePendente) {
        throw new Error("Já existe um convite pendente para este email.");
    }

    // 4. Gerar token único e expiração (7 dias)
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. Criar convite
    const convite = await prisma.convite.create({
        data: {
            email: emailFormatted,
            contaId,
            streamingId: data.streamingId,
            status: "pendente",
            token,
            expiresAt,
            convidadoPorId,
        },
        include: {
            streaming: {
                include: { catalogo: true }
            }
        }
    });

    // 6. Criar notificação para o sistema

    // Check if invited email belongs to a user
    const usuarioConvidado = await prisma.usuario.findUnique({
        where: { email: emailFormatted }
    });

    if (usuarioConvidado) {
        await prisma.notificacao.create({
            data: {
                contaId, // Notification context
                usuarioId: usuarioConvidado.id,
                tipo: "convite_recebido",
                titulo: "Novo Convite",
                descricao: `Você foi convidado para participar da conta de um administrador.${convite.streaming ? " Inclui acesso a streaming." : ""}`,
                metadata: {
                    conviteId: convite.id,
                    email: emailFormatted,
                    link: `/convite/${token}`
                },
                lida: false
            }
        });
    }

    // Notify all Admins that an invite was sent (Account Broadcast)
    await prisma.notificacao.create({
        data: {
            contaId,
            usuarioId: null, // Broadcast to all admins
            tipo: "assinatura_editada", // Usando um tipo compatível ou genérico para admin ver
            titulo: "Convite Enviado",
            descricao: `Um convite foi enviado para ${emailFormatted}.${convite.streaming ? " (Vinculado a streaming)" : ""}`,
            metadata: {
                conviteId: convite.id,
                email: emailFormatted,
                enviadoPor: convidadoPorId
            },
            lida: false
        }
    });

    revalidatePath("/participantes");
    return convite;
}

/**
 * Cancelar convite pendente
 */
export async function cancelInvite(id: string) {
    const { contaId } = await getContext();

    const convite = await prisma.convite.findFirst({
        where: { id, contaId }
    });

    if (!convite) {
        throw new Error("Convite não encontrado");
    }

    await prisma.convite.update({
        where: { id },
        data: { status: "recusado" }
    });

    revalidatePath("/participantes");
}

/**
 * Listar convites pendentes da conta
 */
export async function getPendingInvites() {
    const { contaId } = await getContext();

    return prisma.convite.findMany({
        where: {
            contaId,
            status: "pendente",
            expiresAt: { gt: new Date() }
        },
        include: {
            streaming: {
                include: { catalogo: true }
            },
            convidadoPor: {
                select: { nome: true, email: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

/**
 * Valida um token de convite e retorna os detalhes
 */
export async function validateInviteToken(token: string) {
    const convite = await prisma.convite.findUnique({
        where: { token },
        include: {
            conta: {
                select: { nome: true }
            },
            streaming: {
                include: { catalogo: true }
            }
        }
    });

    if (!convite) {
        throw new Error("Token de convite inválido.");
    }

    if (convite.status !== "pendente") {
        throw new Error("Este convite já foi utilizado ou cancelado.");
    }

    if (new Date() > convite.expiresAt) {
        throw new Error("Este convite expirou.");
    }

    return convite;
}

/**
 * Aceita um convite vinculando o usuário logado
 */
export async function acceptInvite(token: string) {
    const { userId } = await getContext(); // Usuário que está aceitando

    const convite = await validateInviteToken(token);
    const convidado = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!convidado) throw new Error("Usuário não encontrado.");

    const result = await prisma.$transaction(async (tx) => {
        // 1. Marcar convite como aceito
        await tx.convite.update({
            where: { id: convite.id },
            data: { status: "aceito", usuarioId: userId }
        });

        // 2. Garantir que o Participante existe e está ativo na Conta
        // Procuramos por userId na conta
        let participante = await tx.participante.findUnique({
            where: {
                contaId_userId: {
                    contaId: convite.contaId,
                    userId
                }
            }
        });

        if (participante) {
            if (participante.status !== "ativo") {
                participante = await tx.participante.update({
                    where: { id: participante.id },
                    data: { status: "ativo" }
                });
            }
        } else {
            // Se não existe por userId, verificamos se existe por email desvinculado
            participante = await tx.participante.findFirst({
                where: {
                    contaId: convite.contaId,
                    email: convite.email,
                    userId: null
                }
            });

            if (participante) {
                participante = await tx.participante.update({
                    where: { id: participante.id },
                    data: { userId, status: "ativo" }
                });
            } else {
                // Criar novo participante
                participante = await tx.participante.create({
                    data: {
                        contaId: convite.contaId,
                        nome: convidado.nome,
                        email: convidado.email,
                        userId: userId,
                        status: "ativo"
                    }
                });
            }
        }

        // 3. Se houver streaming vinculado, criar assinatura
        if (convite.streamingId && participante) {
            const streamingId = convite.streamingId;

            // Verificar se já tem assinatura
            const existingSub = await tx.assinatura.findFirst({
                where: { participanteId: participante.id, streamingId, status: { not: "cancelada" } }
            });

            if (!existingSub) {
                // Delegate to Service
                const { SubscriptionService } = await import("@/services/subscription.service");
                await SubscriptionService.createFromStreaming(tx, participante.id, streamingId);
            }
        }

        // 5. Notificar Admins (Account Broadcast)
        await tx.notificacao.create({
            data: {
                contaId: convite.contaId,
                usuarioId: null, // Broadcast to all admins
                tipo: "convite_aceito",
                titulo: "Convite aceito",
                descricao: `${convidado.nome} aceitou o convite para entrar na conta.`,
                metadata: {
                    participanteId: participante?.id,
                    usuarioId: userId,
                    convidadoPorId: convite.convidadoPorId
                }
            }
        });

        return { participanteId: participante?.id };
    });

    revalidatePath("/participantes");
    revalidatePath("/assinaturas");
    return result;
}
