import { Prisma } from "@prisma/client";

/**
 * Metadata for tracking who and why a change was made.
 */
export interface AuditMetadata {
    userId?: number;
    origem?: "USER" | "SYSTEM" | "WEBHOOK" | "CRON" | "ADMIN";
    motivo?: string;
}

/**
 * Base type for args that include audit metadata.
 */
interface AuditArgs {
    auditMetadata?: AuditMetadata;
}

/**
 * Prisma Client Extension for SCD Type 2 Audit Trail.
 * Automatically manages 'Assinatura', 'Streaming', and 'LotePagamento' history.
 */
export const auditExtension = Prisma.defineExtension((client) => {
    return client.$extends({
        name: "audit-trail",
        query: {
            assinatura: {
                async update({ args, query }) {
                    const { where, data, auditMetadata } = args as any;

                    // 1. Fetch current state before update using 'client' which is the transaction context if active
                    const current = await (client as any).assinatura.findUnique({ where });
                    if (!current) return query(args);

                    const result = await query(args);

                    // 2. Detect changes in relevant fields
                    const hasStatusChanged = data.status && data.status !== current.status;
                    const hasValorChanged = data.valor && data.valor.toString() !== current.valor.toString();
                    const hasFreqChanged = data.frequencia && data.frequencia !== current.frequencia;

                    if (hasStatusChanged || hasValorChanged || hasFreqChanged) {
                        const now = new Date();

                        // Close previous history record
                        await (client as any).assinaturaHistory.updateMany({
                            where: { assinaturaId: current.id, validoAte: null },
                            data: { validoAte: now }
                        });

                        // Create new history record
                        await (client as any).assinaturaHistory.create({
                            data: {
                                assinaturaId: current.id,
                                statusAnterior: current.status,
                                statusNovo: (result as any).status,
                                valorAnterior: current.valor,
                                valorNovo: (result as any).valor,
                                frequenciaAnterior: current.frequencia,
                                frequenciaNovo: (result as any).frequencia,
                                motivo: auditMetadata?.motivo || "Atualização de sistema",
                                origem: auditMetadata?.origem || "SYSTEM",
                                alteradoPor: auditMetadata?.userId,
                                validoDe: now
                            }
                        });
                    }

                    return result;
                },
                async create({ args, query }) {
                    const result = await query(args);
                    const auditMetadata = (args as any).auditMetadata;

                    await (client as any).assinaturaHistory.create({
                        data: {
                            assinaturaId: (result as any).id,
                            statusNovo: (result as any).status,
                            valorNovo: (result as any).valor,
                            frequenciaNovo: (result as any).frequencia,
                            motivo: auditMetadata?.motivo || "Criação inicial",
                            origem: auditMetadata?.origem || "SYSTEM",
                            alteradoPor: auditMetadata?.userId,
                            validoDe: new Date()
                        }
                    });
                    return result;
                }
            },
            streaming: {
                async update({ args, query }) {
                    const { where, data, auditMetadata } = args as any;

                    const current = await (client as any).streaming.findUnique({ where });
                    if (!current) return query(args);

                    const result = await query(args);

                    const hasValorChanged = data.valorIntegral && data.valorIntegral.toString() !== current.valorIntegral.toString();

                    if (hasValorChanged) {
                        const now = new Date();
                        await (client as any).streamingHistory.updateMany({
                            where: { streamingId: current.id, validoAte: null },
                            data: { validoAte: now }
                        });

                        await (client as any).streamingHistory.create({
                            data: {
                                streamingId: current.id,
                                valorAnterior: current.valorIntegral,
                                valorNovo: (result as any).valorIntegral,
                                origem: auditMetadata?.origem || "SYSTEM",
                                validoDe: now
                            }
                        });
                    }

                    return result;
                }
            },
            lotePagamento: {
                async update({ args, query }) {
                    const { where, data, auditMetadata } = args as any;

                    const current = await (client as any).lotePagamento.findUnique({ where });
                    if (!current) return query(args);

                    const result = await query(args);

                    const hasStatusChanged = data.status && data.status !== current.status;

                    if (hasStatusChanged) {
                        const now = new Date();
                        await (client as any).loteHistory.updateMany({
                            where: { lotePagamentoId: current.id, validoAte: null },
                            data: { validoAte: now }
                        });

                        await (client as any).loteHistory.create({
                            data: {
                                lotePagamentoId: current.id,
                                statusAnterior: current.status,
                                statusNovo: (result as any).status,
                                motivo: auditMetadata?.motivo || data.motivoRejeicao,
                                origem: auditMetadata?.origem || "SYSTEM",
                                alteradoBy: auditMetadata?.userId,
                                validoDe: now
                            }
                        });
                    }

                    return result;
                },
                async create({ args, query }) {
                    const result = await query(args);
                    const auditMetadata = (args as any).auditMetadata;

                    await (client as any).loteHistory.create({
                        data: {
                            lotePagamentoId: (result as any).id,
                            statusNovo: (result as any).status,
                            motivo: auditMetadata?.motivo || "Criação inicial",
                            origem: auditMetadata?.origem || "SYSTEM",
                            alteradoBy: auditMetadata?.userId,
                            validoDe: new Date()
                        }
                    });
                    return result;
                }
            }
        }
    });
});
