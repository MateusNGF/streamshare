import { prisma } from "@/lib/db";
import { Prisma, StatusAssinatura, StatusConvite, TipoNotificacao } from "@prisma/client";
import { StreamingService } from "./streaming.service";

export class InviteService {
    /**
     * Cancels all pending participation requests once a streaming reaches its capacity.
     * Notify users about the closure.
     */
    static async handleStreamingFull(streamingId: number, tx: Prisma.TransactionClient = prisma) {
        const remaining = await StreamingService.getRemainingSpots(streamingId, tx);

        if (remaining > 0) return;

        // Find all pending requests for this streaming
        const pendingRequests = await tx.convite.findMany({
            where: {
                streamingId,
                status: StatusConvite.solicitado
            },
            select: { id: true, usuarioId: true, contaId: true }
        });

        if (pendingRequests.length === 0) return;

        // Bulk reject
        await tx.convite.updateMany({
            where: { id: { in: pendingRequests.map(r => r.id) } },
            data: { status: StatusConvite.recusado }
        });

        // Notifications
        const notificacoes = pendingRequests
            .filter(r => r.usuarioId !== null)
            .map(r => ({
                contaId: r.contaId,
                usuarioId: r.usuarioId!,
                tipo: TipoNotificacao.solicitacao_participacao_recusada,
                titulo: "Vagas Esgotadas",
                descricao: "Infelizmente, as vagas para este grupo acabaram antes da sua aprovação."
            }));

        if (notificacoes.length > 0) {
            await tx.notificacao.createMany({
                data: notificacoes
            });
        }
    }

    /**
     * Validates if a private invite is still valid (token, status, expiration, and spots).
     */
    static async validateInviteForAcceptance(token: string, tx: Prisma.TransactionClient = prisma) {
        const invite = await tx.convite.findUnique({
            where: { token },
            include: {
                conta: { select: { nome: true } },
                streaming: {
                    include: {
                        catalogo: true,
                        conta: { select: { nome: true } },
                        _count: {
                            select: {
                                assinaturas: {
                                    where: { status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa, StatusAssinatura.pendente] } }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!invite) {
            throw new Error("Token de convite inválido.");
        }

        if (invite.status !== StatusConvite.pendente) {
            throw new Error("Este convite já foi utilizado ou cancelado.");
        }

        if (invite.expiresAt && new Date() > invite.expiresAt) {
            throw new Error("Este convite expirou.");
        }

        // If it's linked to a streaming, check spots
        if (invite.streaming) {
            const occupied = invite.streaming._count.assinaturas;
            if (occupied >= invite.streaming.limiteParticipantes) {
                throw new Error("Poxa, este convite era válido, mas as vagas para este grupo já foram preenchidas por outros usuários.");
            }
        }

        return invite;
    }
}
