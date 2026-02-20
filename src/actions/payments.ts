"use server";

import { prisma } from "@/lib/db";


import { getContext } from "@/lib/action-context";

export async function getPaymentsData() {
    try {
        const { contaId } = await getContext();
        const agora = new Date();

        // Fetch subscriptions for the list (keeping this but optimizing stats)
        const assinaturas = await prisma.assinatura.findMany({
            where: {
                streaming: { contaId },
            },
            include: {
                participante: {
                    select: { nome: true },
                },
                streaming: {
                    include: {
                        catalogo: {
                            select: { nome: true },
                        },
                    },
                },
                cobrancas: {
                    orderBy: { periodoFim: "desc" }
                }
            },
            orderBy: { dataInicio: "asc" },
        });

        // Use a transaction for atomic consistency across multiple aggregates
        const [totalToReceiveAgg, receivedAgg, pendingAgg, overdueAgg] = await prisma.$transaction([
            // 1. Total to receive (Sum of all active subscription values)
            prisma.assinatura.aggregate({
                where: {
                    streaming: { contaId },
                    status: "ativa"
                },
                _sum: {
                    valor: true
                }
            }),
            // 2. Received (Active subscriptions with a paid charge covering today)
            prisma.assinatura.aggregate({
                where: {
                    streaming: { contaId },
                    status: "ativa",
                    cobrancas: {
                        some: {
                            status: "pago",
                            periodoInicio: { lte: agora },
                            periodoFim: { gte: agora }
                        }
                    }
                },
                _sum: {
                    valor: true
                }
            }),
            // 3. Pending (Active subscriptions with a pending charge covering today)
            prisma.assinatura.aggregate({
                where: {
                    streaming: { contaId },
                    status: "ativa",
                    cobrancas: {
                        some: {
                            status: "pendente",
                            periodoInicio: { lte: agora },
                            periodoFim: { gte: agora }
                        }
                    }
                },
                _sum: {
                    valor: true
                }
            }),
            // 4. Overdue (Subscriptions with at least one pending or overdue charge past its due date)
            prisma.assinatura.aggregate({
                where: {
                    streaming: { contaId },
                    cobrancas: {
                        some: {
                            status: { in: ["pendente", "atrasado"] },
                            periodoFim: { lt: agora }
                        }
                    }
                },
                _sum: {
                    valor: true
                }
            })
        ]);

        const data = {
            assinaturas,
            stats: {
                totalToReceive: totalToReceiveAgg._sum.valor?.toNumber() || 0,
                received: receivedAgg._sum.valor?.toNumber() || 0,
                pending: pendingAgg._sum.valor?.toNumber() || 0,
                overdue: overdueAgg._sum.valor?.toNumber() || 0,
            },
        };

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PAYMENTS_DATA_ERROR]", error);
        return { success: false, error: "Erro ao buscar dados de pagamentos" };
    }
}

/**
 * Realiza o estorno de um pagamento via MercadoPago.
 */
export async function refundPaymentAction(paymentId: string) {
    try {
        const { nivelAcesso } = await getContext();

        // Apenas o proprietário ou admin pode estornar.
        if (nivelAcesso !== 'owner' && nivelAcesso !== 'admin') {
            return { success: false, error: "Permissão insuficiente para realizar estornos." };
        }

        if (!paymentId) {
            return { success: false, error: "ID do pagamento não fornecido." };
        }

        const { refundPayment } = await import("@/lib/mercado-pago");
        const result = await refundPayment(paymentId);

        if (result.success) {
            return { success: true, message: "Estorno processado pelo MercadoPago. O status será atualizado em instantes." };
        }

        return { success: false, error: result.error || "Erro ao processar estorno no gateway." };
    } catch (error: any) {
        console.error("[REFUND_PAYMENT_ERROR]", error);
        return { success: false, error: "Erro interno ao processar estorno." };
    }
}
