
import { prisma } from "@/lib/db";
import { StatusAssinatura } from "@prisma/client";
import { generateShareToken, verifyShareToken } from "@/lib/share-token";

export class StreamingService {
    /**
     * Get the count of occupied spots for a streaming service.
     * Includes active, suspended, and pending subscriptions.
     */
    static async getOccupiedSpots(streamingId: number, tx = prisma): Promise<number> {
        return tx.assinatura.count({
            where: {
                streamingId,
                status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa, StatusAssinatura.pendente] }
            }
        });
    }

    /**
     * Get the number of remaining spots for a streaming service.
     */
    static async getRemainingSpots(streamingId: number, tx = prisma): Promise<number> {
        const streaming = await tx.streaming.findUnique({
            where: { id: streamingId },
            select: { limiteParticipantes: true }
        });

        if (!streaming) return 0;

        const occupied = await this.getOccupiedSpots(streamingId, tx);
        return Math.max(0, streaming.limiteParticipantes - occupied);
    }

    /**
     * Generate a new share token for a streaming service and save it as a public invite.
     * ACID: Uses a transaction to ensure spots are checked and invite is created atomically.
     */
    static async generateShareLink(streamingId: number, expiration: string, contaId: number, userId: number): Promise<string> {
        return prisma.$transaction(async (tx) => {
            const streaming = await tx.streaming.findUnique({
                where: { id: streamingId, contaId },
            });

            if (!streaming) {
                throw new Error("Streaming não encontrado");
            }

            const remaining = await this.getRemainingSpots(streamingId, tx as any);
            if (remaining <= 0) {
                throw new Error("Não é possível gerar link de convite: todas as vagas estão preenchidas.");
            }

            const token = generateShareToken(streamingId, expiration);
            const expiresAt = this.calculateExpirationDate(expiration);

            await tx.convite.create({
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
        });
    }

    /**
     * Clean Code & SOLID: Extracted date calculation logic
     */
    private static calculateExpirationDate(expiration: string): Date {
        const date = new Date();
        if (expiration === 'never') {
            date.setFullYear(date.getFullYear() + 10);
            return date;
        }

        const value = parseInt(expiration);
        const unit = expiration.slice(-1);

        const units: Record<string, (d: Date, v: number) => void> = {
            'm': (d, v) => d.setMinutes(d.getMinutes() + v),
            'h': (d, v) => d.setHours(d.getHours() + v),
            'd': (d, v) => d.setDate(d.getDate() + v),
        };

        const updateFn = units[unit];
        if (updateFn) {
            updateFn(date, value);
        } else {
            // Default to 7 days if unit is unknown
            date.setDate(date.getDate() + 7);
        }

        return date;
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
