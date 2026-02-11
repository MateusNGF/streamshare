"use server";

import { prisma } from "@/lib/db";


import { getContext } from "@/lib/action-context";

export async function getPaymentsData() {
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

    return {
        assinaturas,
        stats: {
            totalToReceive: totalToReceiveAgg._sum.valor?.toNumber() || 0,
            received: receivedAgg._sum.valor?.toNumber() || 0,
            pending: pendingAgg._sum.valor?.toNumber() || 0,
            overdue: overdueAgg._sum.valor?.toNumber() || 0,
        },
    };
}
