
import { prisma } from "@/lib/db";
import { Prisma, StatusAssinatura } from "@prisma/client";
import { StreamingService } from "./streaming.service";

export class InviteService {
    /**
     * Cancels all pending participation requests once a streaming reaches its capacity.
     * Notify users about the closure.
     */
    static async handleStreamingFull(streamingId: number, tx: any = prisma) {
        const remaining = await StreamingService.getRemainingSpots(streamingId, tx);

        if (remaining > 0) return;

        const requests = await tx.participacaoRequest.findMany({
            where: {
                streamingId,
                status: "pendente"
            }
        });

        if (requests.length === 0) return;

        const validRequests = requests.filter((r: any) => r.status === "pendente");

        // Notifications
        const notificacoes = validRequests
            .filter((r: any) => r.usuarioId !== null)
            .map((r: any) => ({
                contaId: r.contaId,
                usuarioId: r.usuarioId!,
                tipo: "cobranca_vencida", // Using generic type for capacity reached
                titulo: "Grupo Lotado",
                descricao: "Infelizmente as vagas deste grupo foram preenchidas enquanto você aguardava.",
                entidadeId: streamingId,
            }));

        if (notificacoes.length > 0) {
            await tx.notificacao.createMany({
                data: notificacoes
            });
        }

        await Promise.all(validRequests.map((r: any) =>
            tx.participacaoRequest.update({
                where: { id: r.id },
                data: { status: "rejeitado", motivoRejeicao: "Capacidade máxima atingida" }
            })
        ));
    }

    /**
     * Validates if a private invite is still valid (token, status, expiration, and spots).
     */
    static async validateInviteForAcceptance(token: string, tx: any = prisma) {
        const invite = await tx.convite.findUnique({
            where: { token },
            include: {
                streaming: {
                    select: {
                        id: true,
                        limiteParticipantes: true,
                        isAtivo: true,
                        catalogo: { select: { nome: true } }
                    }
                }
            }
        });

        if (!invite) throw new Error("Convite não encontrado.");
        if (invite.status !== "pendente") throw new Error("Este convite já foi utilizado ou cancelado.");
        if (invite.expiresAt < new Date()) throw new Error("Este convite expirou.");
        if (!invite.streaming.isAtivo) throw new Error("Este grupo não está mais ativo.");

        const remaining = await StreamingService.getRemainingSpots(invite.streamingId, tx);
        if (remaining <= 0) throw new Error("Este grupo já está lotado.");

        return invite;
    }
}
