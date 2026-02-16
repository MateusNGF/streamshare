
import { prisma } from "@/lib/db";
import { StatusAssinatura } from "@prisma/client";
import { generateShareToken, verifyShareToken } from "@/lib/share-token";

export class StreamingService {
    /**
     * Get the count of occupied spots for a streaming service.
     * Includes active, suspended, and pending subscriptions.
     */
    static async getOccupiedSpots(streamingId: number): Promise<number> {
        return prisma.assinatura.count({
            where: {
                streamingId,
                status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa, StatusAssinatura.pendente] }
            }
        });
    }

    /**
     * Get the number of remaining spots for a streaming service.
     */
    static async getRemainingSpots(streamingId: number): Promise<number> {
        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId },
            select: { limiteParticipantes: true }
        });

        if (!streaming) return 0;

        const occupied = await this.getOccupiedSpots(streamingId);
        return Math.max(0, streaming.limiteParticipantes - occupied);
    }

    /**
     * Generate a new share token for a streaming service and save it as a public invite.
     */
    static async generateShareLink(streamingId: number, expiration: string, contaId: number, userId: number): Promise<string> {
        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId, contaId },
        });

        if (!streaming) {
            throw new Error("Streaming não encontrado");
        }

        const remaining = await this.getRemainingSpots(streamingId);
        if (remaining <= 0) {
            throw new Error("Não é possível gerar link de convite: todas as vagas estão preenchidas.");
        }

        const token = generateShareToken(streamingId, expiration);

        // Calculate expiration date
        const expiresAt = new Date();
        if (expiration !== 'never') {
            const value = parseInt(expiration);
            const unit = expiration.slice(-1);
            if (unit === 'm') expiresAt.setMinutes(expiresAt.getMinutes() + value);
            else if (unit === 'h') expiresAt.setHours(expiresAt.getHours() + value);
            else if (unit === 'd') expiresAt.setDate(expiresAt.getDate() + value);
            else expiresAt.setDate(expiresAt.getDate() + 7); // Default
        } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 10); // Far future
        }

        await prisma.convite.create({
            data: {
                email: "public-link@system.internal",
                contaId,
                streamingId,
                token,
                status: "pendente",
                expiresAt,
                convidadoPorId: userId
            }
        });

        return token;
    }

    /**
     * Validate a public share token and return sanitized streaming data.
     */
    static async validatePublicToken(token: string) {
        const sharePayload = verifyShareToken(token);
        let streaming;

        if (sharePayload) {
            // Check if revoked in DB
            const dbInvite = await prisma.convite.findFirst({
                where: {
                    token,
                    status: "pendente",
                    expiresAt: { gt: new Date() }
                }
            });

            if (!dbInvite && token.length > 50) return null;

            streaming = await prisma.streaming.findUnique({
                where: { id: sharePayload.streamingId, isAtivo: true },
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
            });
        } else {
            // Legacy/Public Token (UUID)
            streaming = await prisma.streaming.findUnique({
                where: { publicToken: token, isAtivo: true, isPublico: true },
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
            });
        }

        if (!streaming) return null;

        const { credenciaisLogin, credenciaisSenha, ...safeStreaming } = streaming;

        return {
            ...safeStreaming,
            valorIntegral: (safeStreaming.valorIntegral as any).toNumber(),
            vagasRestantes: Math.max(0, safeStreaming.limiteParticipantes - safeStreaming._count.assinaturas)
        };
    }
}
