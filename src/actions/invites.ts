"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { StatusConvite, TipoNotificacao } from "@prisma/client";
import { ParticipantService } from "@/services/participant.service";
import { InviteService } from "@/services/invite.service";

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

        if (!data.email) return { success: false, error: "Email é obrigatório" };

        // 1. Validar se o usuário não está convidando a si mesmo
        const currentUser = await prisma.usuario.findUnique({
            where: { id: convidadoPorId },
            select: { email: true }
        });

        if (currentUser?.email.toLowerCase() === emailFormatted) {
            return { success: false, error: "Você não pode convidar a si mesmo." };
        }

        // 2. Verificar se já existe como participante ativo na conta
        const participanteExistente = await prisma.participante.findFirst({
            where: { contaId, email: emailFormatted, status: "ativo" }
        });

        if (participanteExistente) {
            return { success: false, error: "Este usuário já é um participante ativo nesta conta." };
        }

        // 3. Verificar convite pendente existente
        const convitePendente = await prisma.convite.findFirst({
            where: {
                contaId,
                email: emailFormatted,
                status: StatusConvite.pendente,
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

        // 5. Executar em Transação
        const result = await prisma.$transaction(async (tx) => {
            const convite = await tx.convite.create({
                data: {
                    email: emailFormatted,
                    contaId,
                    streamingId: data.streamingId,
                    status: StatusConvite.pendente,
                    token,
                    expiresAt,
                    convidadoPorId,
                },
                include: { streaming: { include: { catalogo: true } } }
            });

            const usuarioConvidado = await tx.usuario.findUnique({ where: { email: emailFormatted } });

            if (usuarioConvidado) {
                await tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: usuarioConvidado.id,
                        tipo: TipoNotificacao.convite_recebido,
                        titulo: "Novo Convite",
                        descricao: `Você foi convidado para participar da conta de um Organizador.${convite.streaming ? " Inclui acesso a streaming." : ""}`,
                        metadata: { conviteId: convite.id, email: emailFormatted, link: `/convite/${token}` }
                    }
                });
            }

            // Notify all Admins
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: TipoNotificacao.assinatura_editada,
                    titulo: "Convite Enviado",
                    descricao: `Um convite foi enviado para ${emailFormatted}.${convite.streaming ? " (Vinculado a streaming)" : ""}`,
                    metadata: { conviteId: convite.id, email: emailFormatted, enviadoPor: convidadoPorId }
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

        await prisma.convite.update({
            where: { id, contaId, status: StatusConvite.pendente },
            data: { status: StatusConvite.recusado }
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
                status: StatusConvite.pendente,
                expiresAt: { gt: new Date() }
            },
            include: {
                streaming: { include: { catalogo: true } },
                convidadoPor: { select: { nome: true, email: true } }
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
        const invite = await InviteService.validateInviteForAcceptance(token);
        return { success: true, data: invite };
    } catch (error: any) {
        return { success: false, error: error.message, code: "INVALID_TOKEN" };
    }
}

/**
 * Aceita um convite vinculando o usuário logado
 */
export async function acceptInvite(token: string, whatsappNumero?: string) {
    try {
        const { userId } = await getContext();

        // 1. Validar convite e spots via InviteService
        const convite = await InviteService.validateInviteForAcceptance(token);

        const convidado = await prisma.usuario.findUnique({ where: { id: userId } });
        if (!convidado) return { success: false, error: "Usuário não encontrado." };

        const result = await prisma.$transaction(async (tx) => {
            // 2. Marcar convite como aceito
            await tx.convite.update({
                where: { id: convite.id },
                data: { status: StatusConvite.aceito, usuarioId: userId }
            });

            // 3. Garantir Participante
            const participante = await ParticipantService.findOrCreateParticipant(tx, {
                contaId: convite.contaId,
                nome: convidado.nome,
                email: convidado.email,
                userId: userId,
                whatsappNumero: whatsappNumero || convidado.whatsappNumero || ""
            });

            // 4. Criar Assinatura se houver streaming
            if (convite.streamingId) {
                const streamingId = convite.streamingId;
                const existingSub = await tx.assinatura.findFirst({
                    where: { participanteId: participante.id, streamingId, status: { not: "cancelada" } }
                });

                if (!existingSub) {
                    const { SubscriptionService } = await import("@/services/subscription.service");
                    await SubscriptionService.createFromStreaming(tx, participante.id, streamingId);
                }

                // 5. Side effect: handle full streaming
                await InviteService.handleStreamingFull(streamingId, tx);
            }

            // 6. Notificar Admins
            await tx.notificacao.create({
                data: {
                    contaId: convite.contaId,
                    usuarioId: null,
                    tipo: TipoNotificacao.convite_aceito,
                    titulo: "Convite aceito",
                    descricao: `${convidado.nome} aceitou o convite para entrar na conta.`,
                    metadata: { participanteId: participante?.id, usuarioId: userId, convidadoPorId: convite.convidadoPorId }
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
