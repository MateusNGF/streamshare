"use server";

import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FilterService } from "@/services/filter.service";
import { StatusCobranca } from "@prisma/client";
import { billingService } from "@/services/billing-service";

export async function getFaturasUsuario(filters?: { status?: StatusCobranca; participanteId?: string }) {
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
export async function getFaturasAnalytics(period: string = "6m") {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const agora = new Date();
        const numMonths = period === "12m" ? 12 : 6;
        const startDate = subMonths(startOfMonth(agora), numMonths - 1);

        const history = await prisma.cobranca.findMany({
            where: {
                assinatura: { participante: { userId: user.userId } },
                dataVencimento: { gte: startDate, lte: endOfMonth(agora) },
                deletedAt: null
            },
            select: {
                status: true,
                valor: true,
                dataVencimento: true
            }
        });

        const monthsData: any[] = [];
        for (let i = numMonths - 1; i >= 0; i--) {
            const date = subMonths(agora, i);
            const monthName = format(date, "MMM", { locale: ptBR });
            const monthKey = format(date, "yyyy-MM");

            const monthCobrancas = history.filter(c => format(c.dataVencimento, "yyyy-MM") === monthKey);

            monthsData.push({
                month: monthName,
                key: monthKey,
                previsto: monthCobrancas.reduce((acc, curr) => acc + curr.valor.toNumber(), 0),
                realizado: monthCobrancas.filter(c => c.status === 'pago').reduce((acc, curr) => acc + curr.valor.toNumber(), 0),
            });
        }

        return {
            success: true,
            data: monthsData
        };
    } catch (error: any) {
        console.error("[GET_FATURAS_ANALYTICS_ERROR]", error);
        return { success: false, error: "Erro ao carregar dados analíticos de faturas" };
    }
}
