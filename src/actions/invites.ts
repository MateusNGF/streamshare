"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { TipoNotificacao } from "@prisma/client";
import { ParticipantService } from "@/services/participant.service";

/**
 * Convidar usuário via email
 */
export async function inviteUser(data: {
    email: string;
    streamingId?: number;
}) {
    try {
        const { contaId, userId: convidadoPorId } = await getContext();
        const emailFormatted = data.email.toLowerCase().trim();

        // 1. Validar email
        if (!data.email) {
            return { success: false, error: "Email é obrigatório" };
        }

        // 1.5. Validar se o usuário não está convidando a si mesmo
        const currentUser = await prisma.usuario.findUnique({
            where: { id: convidadoPorId },
            select: { email: true }
        });

        if (currentUser?.email.toLowerCase() === emailFormatted) {
            return { success: false, error: "Você não pode convidar a si mesmo." };
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
            return { success: false, error: "Este usuário já é um participante ativo nesta conta." };
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
            return { success: false, error: "Já existe um convite pendente para este email." };
        }

        // 4. Gerar token único e expiração (7 dias)
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // 5. Executar em Transação (Atomicity)
        const result = await prisma.$transaction(async (tx) => {
            // Criar convite
            const convite = await tx.convite.create({
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

            // Check if invited email belongs to a user
            const usuarioConvidado = await tx.usuario.findUnique({
                where: { email: emailFormatted }
            });

            if (usuarioConvidado) {
                await tx.notificacao.create({
                    data: {
                        contaId,
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
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "assinatura_editada",
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

            return convite;
        });

        revalidatePath("/participantes");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[INVITE_USER_ERROR]", error);
        return { success: false, error: error.message || "Erro ao convidar usuário" };
    }
}

/**
 * Cancelar convite pendente
 */
export async function cancelInvite(id: string) {
    try {
        const { contaId } = await getContext();

        const convite = await prisma.convite.findFirst({
            where: { id, contaId }
        });

        if (!convite) {
            return { success: false, error: "Convite não encontrado" };
        }

        await prisma.convite.update({
            where: { id },
            data: { status: "recusado" }
        });

        revalidatePath("/participantes");
        return { success: true };
    } catch (error: any) {
        console.error("[CANCEL_INVITE_ERROR]", error);
        return { success: false, error: "Erro ao cancelar convite" };
    }
}

/**
 * Listar convites pendentes da conta
 */
export async function getPendingInvites() {
    try {
        const { contaId } = await getContext();

        const data = await prisma.convite.findMany({
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

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PENDING_INVITES_ERROR]", error);
        return { success: false, error: "Erro ao buscar convites pendentes" };
    }
}

/**
 * Valida um token de convite e retorna os detalhes
 */
export async function validateInviteToken(token: string) {
    try {
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
            return { success: false, error: "Token de convite inválido.", code: "INVALID_TOKEN" };
        }

        if (convite.status !== "pendente") {
            return { success: false, error: "Este convite já foi utilizado ou cancelado.", code: "ALREADY_USED" };
        }

        if (new Date() > convite.expiresAt) {
            return { success: false, error: "Este convite expirou.", code: "EXPIRED" };
        }

        return { success: true, data: convite };
    } catch (error: any) {
        console.error("[VALIDATE_INVITE_TOKEN_ERROR]", error);
        return { success: false, error: "Erro ao validar token de convite" };
    }
}

/**
 * Aceita um convite vinculando o usuário logado
 */
export async function acceptInvite(token: string) {
    try {
        const { userId } = await getContext(); // Usuário que está aceitando

        const validateResult = await validateInviteToken(token);
        if (!validateResult.success) return validateResult;

        const convite = validateResult.data!;

        const convidado = await prisma.usuario.findUnique({ where: { id: userId } });
        if (!convidado) return { success: false, error: "Usuário não encontrado." };

        const result = await prisma.$transaction(async (tx) => {
            // 1. Marcar convite como aceito
            await tx.convite.update({
                where: { id: convite.id },
                data: { status: "aceito", usuarioId: userId }
            });

            // 2. Garantir Participante
            const participante = await ParticipantService.findOrCreateParticipant(tx, {
                contaId: convite.contaId,
                nome: convidado.nome,
                email: convidado.email,
                userId: userId,
                whatsappNumero: "" // We might not have it from the user object here, findOrCreateParticipant handles this
            });

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
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[ACCEPT_INVITE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao aceitar convite" };
    }
}
