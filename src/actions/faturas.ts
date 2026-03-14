"use server";

import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FilterService } from "@/services/filter.service";
import { StatusCobranca } from "@prisma/client";
import { billingService } from "@/services/billing-service";

export async function getFaturasUsuario(filters?: {
    status?: StatusCobranca;
    participanteId?: string;
    q?: string;
    streaming?: string;
    organizador?: string;
    vencimento?: string;
    valor?: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const where = FilterService.buildFaturaUserWhere(user.userId, filters);

        const cobrancas = await prisma.cobranca.findMany({
            where,
            select: {
                id: true,
                status: true,
                valor: true,
                dataVencimento: true,
                periodoInicio: true,
                periodoFim: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                dataPagamento: true,
                comprovanteUrl: true,
                dataEnvioComprovante: true,
                gatewayTransactionId: true,
                gatewayProvider: true,
                tentativas: true,
                metadataJson: true,
                lotePagamentoId: true,
                assinaturaId: true,
                assinatura: {
                    select: {
                        id: true,
                        status: true,
                        participanteId: true,
                        frequencia: true,
                        valor: true,
                        streaming: {
                            select: {
                                id: true,
                                apelido: true,
                                catalogo: {
                                    select: {
                                        nome: true,
                                        iconeUrl: true,
                                        corPrimaria: true
                                    }
                                }
                            }
                        },
                        participante: {
                            select: {
                                id: true,
                                nome: true,
                                whatsappNumero: true,
                                contaId: true,
                                conta: {
                                    select: {
                                        id: true,
                                        nome: true,
                                        chavePix: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { dataVencimento: 'asc' }
            ]
        });

        return { success: true, data: cobrancas };
    } catch (error: any) {
        console.error("[GET_FATURAS_USUARIO_ERROR]", error);
        return { success: false, error: "Erro ao buscar faturas do usuário" };
    }
}

export async function getResumoFaturas() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const stats = await prisma.cobranca.groupBy({
            by: ["status"],
            where: {
                assinatura: {
                    participante: {
                        userId: user.userId
                    }
                }
            },
            _sum: {
                valor: true
            },
            _count: {
                _all: true
            }
        });

        const resumo = stats.reduce((acc, curr) => {
            acc[curr.status] = {
                total: curr._sum.valor?.toNumber() || 0,
                count: curr._count._all
            };
            return acc;
        }, {} as Record<StatusCobranca, { total: number; count: number }>);

        return { success: true, data: resumo };
    } catch (error: any) {
        console.error("[GET_RESUMO_FATURAS_ERROR]", error);
        return { success: false, error: "Erro ao buscar resumo das faturas" };
    }
}

/**
 * Retorna dados agregados para a visão de analytics de faturas do participante.
 */
export async function getFaturasAnalytics(period: string = "6m", filters: any = {}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const agora = new Date();
        const numMonths = period === "12m" ? 12 : 6;
        const startDate = subMonths(startOfMonth(agora), numMonths - 1);

        const isStreamingFiltered = !!(filters.streaming && filters.streaming !== "all");

        const whereBase = FilterService.buildFaturaUserWhere(user.userId, filters);

        // Remove dataVencimento if it exists to override it with historical range
        delete whereBase.dataVencimento;

        const history = await prisma.cobranca.findMany({
            where: {
                ...whereBase,
                dataVencimento: { gte: startDate, lte: endOfMonth(agora) },
                deletedAt: null
            },
            include: {
                assinatura: {
                    include: {
                        streaming: {
                            include: { catalogo: true }
                        }
                    }
                }
            }
        });

        // 1. Composition Data (Current Month)
        const startCurrent = startOfMonth(agora);
        const endCurrent = endOfMonth(agora);
        const currentCobrancas = history.filter(c => c.dataVencimento >= startCurrent && c.dataVencimento <= endCurrent);

        const compositionMap = new Map();
        currentCobrancas.forEach(c => {
            const name = c.assinatura.streaming.apelido || c.assinatura.streaming.catalogo.nome;
            const color = c.assinatura.streaming.catalogo.corPrimaria;
            const current = compositionMap.get(name) || { name, value: 0, color };
            current.value += c.valor.toNumber();
            compositionMap.set(name, current);
        });

        const compositionData = Array.from(compositionMap.values());
        const totalCurrentMonth = compositionData.reduce((acc, curr) => acc + curr.value, 0);

        // 2. History & Savings Data
        const monthsData: any[] = [];
        for (let i = numMonths - 1; i >= 0; i--) {
            const date = subMonths(agora, i);
            const monthName = format(date, "MMM", { locale: ptBR });
            const monthKey = format(date, "yyyy-MM");

            const monthCobrancas = history.filter(c => format(c.dataVencimento, "yyyy-MM") === monthKey);

            const valorPago = monthCobrancas.reduce((acc, curr) => acc + curr.valor.toNumber(), 0);
            const valorSolo = monthCobrancas.reduce((acc, curr) => acc + curr.assinatura.streaming.valorIntegral.toNumber(), 0);

            monthsData.push({
                month: monthName,
                key: monthKey,
                pago: valorPago,
                solo: valorSolo,
                economia: Math.max(0, valorSolo - valorPago),
                previsto: valorPago,
                realizado: monthCobrancas.filter(c => c.status === 'pago').reduce((acc, curr) => acc + curr.valor.toNumber(), 0),
            });
        }

        // 3. Velocity Data
        const paidCobrancas = history.filter(c => c.status === 'pago' && c.dataPagamento);
        const velocityData = Array.from({ length: 11 }).map((_, i) => {
            const dayOffset = i - 5;
            const count = paidCobrancas.filter(c => {
                const due = new Date(c.dataVencimento).setHours(0, 0, 0, 0);
                const paid = new Date(c.dataPagamento!).setHours(0, 0, 0, 0);
                const diff = Math.round((paid - due) / (1000 * 60 * 60 * 24));
                return diff === dayOffset;
            }).length;

            let label = `${dayOffset}d`;
            if (dayOffset === 0) label = "No dia";
            if (dayOffset > 0) label = `+${dayOffset}d`;
            return { label, count, dayOffset };
        });

        return {
            success: true,
            data: {
                historyData: monthsData,
                compositionData,
                velocityData,
                totalCurrentMonth,
                isStreamingFiltered
            }
        };
    } catch (error: any) {
        console.error("[GET_FATURAS_ANALYTICS_ERROR]", error);
        return { success: false, error: "Erro ao carregar dados analíticos de faturas" };
    }
}
