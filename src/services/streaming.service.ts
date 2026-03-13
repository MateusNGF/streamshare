
import { prisma, PrismaTransactionClient } from "@/lib/db";
import { Prisma, StatusAssinatura } from "@prisma/client";
import { generateShareToken, verifyShareToken } from "@/lib/share-token";

export class StreamingService {
    /**
     * Get the count of occupied spots for a streaming service.
     * Includes active, suspended, and pending subscriptions.
     */
    static async getOccupiedSpots(streamingId: number, tx: PrismaTransactionClient = prisma): Promise<number> {
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
    static async getRemainingSpots(streamingId: number, tx: PrismaTransactionClient = prisma): Promise<number> {
        const streaming = await tx.streaming.findUnique({
            where: { id: streamingId },
            select: { limiteParticipantes: true }
        });

        if (!streaming) return 0;

        const occupied = await this.getOccupiedSpots(streamingId, tx);
        return Math.max(0, streaming.limiteParticipantes - occupied);
    }

    /**
     * ACID: Ensures the streaming has enough spots for the requested quantity.
     * Throws an error with a user-friendly message if not.
     */
    static async ensureCapacity(streamingId: number, quantity: number = 1, tx: PrismaTransactionClient = prisma) {
        const remaining = await this.getRemainingSpots(streamingId, tx);

        if (remaining < quantity) {
            if (remaining > 0) {
                throw new Error(`Poxa, restam apenas ${remaining} vaga(s) para este grupo.`);
            }
            throw new Error("Poxa, as vagas para este grupo já foram preenchidas por outros usuários.");
        }
    }

    /**
     * SOLID: Centralized Optimistic Locking helper to fetch a streaming with its version and occupancy.
     */
    static async findWithLock(streamingId: number, tx: PrismaTransactionClient = prisma) {
        return tx.streaming.findUnique({
            where: { id: streamingId },
            select: {
                id: true,
                version: true,
                limiteParticipantes: true,
                valorIntegral: true,
                contaId: true,
                catalogo: { select: { nome: true } },
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

    /**
     * SOLID: Centralized Optimistic Locking helper to increment a streaming version.
     */
    static async incrementVersion(streamingId: number, currentVersion: number, tx: PrismaTransactionClient = prisma) {
        const result = await tx.streaming.updateMany({
            where: { id: streamingId, version: currentVersion },
            data: { version: { increment: 1 } }
        });

        if (result.count === 0) {
            throw new Error("As informações do streaming foram alteradas por outro usuário. Por favor, tente novamente.");
        }
    }

    /**
     * SOLID: Combined capacity validation and optimistic locking for a single streaming.
     * The streaming object MUST be fetched first using findWithLock.
     */
    static async validateAndLockCapacity(streaming: any, quantity: number = 1, tx: PrismaTransactionClient = prisma) {
        const currentOccupied = streaming._count.assinaturas;
        if (currentOccupied + quantity > streaming.limiteParticipantes) {
            throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes.`);
        }

        await this.incrementVersion(streaming.id, streaming.version, tx);
    }

    /**
     * Generate a new share token for a streaming service and save it as a public invite.
     * ACID: Uses a transaction to ensure spots are checked and invite is created atomically.
     */
    static async generateShareLink(streamingId: number, expiration: string, contaId: number, userId: number, singleUse: boolean = true): Promise<string> {
        return prisma.$transaction(async (tx) => {
            const streaming = await tx.streaming.findUnique({
                where: { id: streamingId, contaId },
            });

            if (!streaming) {
                throw new Error("Streaming não encontrado");
            }

            const remaining = await this.getRemainingSpots(streamingId, tx);
            if (remaining <= 0) {
                throw new Error("Não é possível gerar link de convite: todas as vagas estão preenchidas.");
            }

            const token = generateShareToken(streamingId, expiration);
            const expiresAt = this.calculateExpirationDate(expiration);

            await tx.convite.create({
                data: {
                    email: null,
                    contaId,
                    streamingId,
                    token,
                    status: "pendente",
                    expiresAt,
                    singleUse,
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

        return {
            ...streaming,
            valorIntegral: (streaming.valorIntegral as any).toNumber(),
            vagasRestantes: Math.max(0, streaming.limiteParticipantes - streaming._count.assinaturas)
        };
    }
}
