"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { StatusParticipante, TipoNotificacao } from "@prisma/client";
import { getContext, AuthenticationError } from "@/lib/action-context";

export async function requestParticipation(streamingId: number) {
    const user = await getCurrentUser();
    if (!user) return { error: "Faça login para solicitar entrada." };

    const userId = user.userId;
    const userEmail = user.email;

    try {
        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId },
            include: { conta: true }
        });

        if (!streaming) return { error: "Streaming não encontrado." };

        // Check if already a participant
        const existing = await prisma.participante.findFirst({
            where: {
                contaId: streaming.contaId,
                userId
            }
        });

        if (existing) {
            if (existing.status === StatusParticipante.ativo) return { error: "Você já é membro deste grupo." };
            if (existing.status === StatusParticipante.pendente) return { error: "Sua solicitação já está pendente." };
            if (existing.status === StatusParticipante.bloqueado) return { error: "Você não pode participar deste grupo." };

            // If refused/left, we'll UPDATE the existing record to pending instead of creating a new one
            await prisma.participante.update({
                where: { id: existing.id },
                data: { status: StatusParticipante.pendente }
            });

            // Notify admins again? (handled in the flow below if we skip return)
        } else {
            // Create New Pending Participant
            // ... will do in transaction below
        }

        // Create or Update Pending Participant
        await prisma.$transaction(async (tx) => {
            const dbUser = await tx.usuario.findUnique({ where: { id: userId } });
            const participantData = {
                contaId: streaming.contaId,
                userId,
                nome: dbUser?.nome || userEmail.split('@')[0],
                email: userEmail,
                status: StatusParticipante.pendente
            };

            const participantes = existing
                ? await tx.participante.update({ where: { id: existing.id }, data: { status: StatusParticipante.pendente } })
                : await tx.participante.create({ data: participantData });

            // Notify Admins
            // Find admins of the account
            const admins = await tx.contaUsuario.findMany({
                where: {
                    contaId: streaming.contaId,
                    nivelAcesso: { in: ['admin', 'owner'] }
                }
            });

            for (const admin of admins) {
                await tx.notificacao.create({
                    data: {
                        contaId: streaming.contaId,
                        usuarioId: admin.usuarioId,
                        tipo: TipoNotificacao.solicitacao_participacao_criada,
                        titulo: 'Nova Solicitação',
                        descricao: `${userEmail} solicitou entrada para o streaming ${streaming.apelido || streaming.id}.`,
                        lida: false,
                        entidadeId: participantes.id
                    }
                });
            }
        });

        return { success: true, message: "Solicitação enviada com sucesso!" };

    } catch (error) {
        console.error("Erro ao solicitar:", error);
        return { error: "Erro ao processar solicitação." };
    }
}

export async function getPendingRequests() {
    const { contaId, nivelAcesso } = await getContext();

    if (nivelAcesso !== 'admin' && nivelAcesso !== 'owner') return [];

    const requests = await prisma.participante.findMany({
        where: {
            contaId,
            status: StatusParticipante.pendente
        },
        include: {
            usuario: {
                select: { email: true } // Removed image, as it might not distinguish between null/undefined or name diff
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return requests;
}


export async function approveRejectParticipation(participanteId: number, action: 'approve' | 'reject') {
    try {
        const { userId: adminId, contaId: adminContaId } = await getContext();
        // 1. Get Participant & Check Permissions
        const participante = await prisma.participante.findUnique({
            where: { id: participanteId },
            include: { conta: true }
        });

        if (!participante) return { error: "Solicitação não encontrada." };

        // Verify if User is Admin of the Group (Conta)
        const membership = await prisma.contaUsuario.findUnique({
            where: {
                contaId_usuarioId: {
                    contaId: participante.contaId,
                    usuarioId: adminId
                }
            }
        });

        if (!membership || membership.nivelAcesso !== 'admin' && membership.nivelAcesso !== 'owner') {
            // Better check: isAtivo and Role
            return { error: "Sem permissão para gerenciar este grupo." };
        }

        // 2. Perform Action
        if (action === 'approve') {
            await prisma.$transaction(async (tx) => {
                // Update Status
                await tx.participante.update({
                    where: { id: participanteId },
                    data: { status: StatusParticipante.ativo }
                });

                // Notify User
                if (participante.userId) {
                    await tx.notificacao.create({
                        data: {
                            contaId: participante.contaId, // Use Group Context
                            usuarioId: participante.userId, // Target the User
                            tipo: TipoNotificacao.solicitacao_participacao_aceita,
                            titulo: 'Solicitação Aprovada!',
                            descricao: `Sua entrada no grupo "${participante.conta.nome}" foi aprovada.`,
                            lida: false
                        }
                    });
                }
            });
            revalidatePath('/dashboard/participantes'); // Adjust path as needed
            return { success: true, message: "Membro aprovado com sucesso." };

        } else if (action === 'reject') {
            await prisma.$transaction(async (tx) => {
                // Update Status (or Delete? Usually keep as Rejected for history)
                await tx.participante.update({
                    where: { id: participanteId },
                    data: { status: StatusParticipante.recusado }
                });

                // Notify User
                if (participante.userId) {
                    await tx.notificacao.create({
                        data: {
                            contaId: participante.contaId,
                            usuarioId: participante.userId,
                            tipo: TipoNotificacao.solicitacao_participacao_recusada,
                            titulo: 'Solicitação Recusada',
                            descricao: `Sua entrada no grupo "${participante.conta.nome}" foi recusada pelo administrador.`,
                            lida: false
                        }
                    });
                }
            });
            revalidatePath('/dashboard/participantes');
            return { success: true, message: "Solicitação recusada." };
        }

    } catch (error) {
        if (error instanceof AuthenticationError) return { error: "Não autenticado" };
        console.error("Erro ao processar solicitação:", error);
        return { error: "Erro interno ao processar." };
    }
}
