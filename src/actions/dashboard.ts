"use server";

import { prisma } from "@/lib/db";


import { getContext } from "@/lib/action-context";

export async function getDashboardStats() {
    const { contaId } = await getContext();

    // 1. Receita Mensal (Sum of active subscriptions' values)
    const subscriptions = await prisma.assinatura.findMany({
        where: {
            streaming: { contaId },
            status: "ativa",
        },
        select: { valor: true },
    });

    const monthlyRevenue = subscriptions.reduce((sum, sub) => sum + sub.valor.toNumber(), 0);

    // 2. Participantes Ativos (Count of participants with at least one active subscription)
    const activeParticipantsCount = await prisma.participante.count({
        where: {
            contaId,
            assinaturas: {
                some: { status: "ativa" },
            },
        },
    });

    // 3. Taxa de Ocupação (Total occupied slots / Total available slots)
    const streamings = await prisma.streaming.findMany({
        where: { contaId, isAtivo: true },
        select: {
            limiteParticipantes: true,
            _count: {
                select: { assinaturas: true },
            },
        },
    });

    let totalSlots = 0;
    let occupiedSlots = 0;

    streamings.forEach((s) => {
        totalSlots += s.limiteParticipantes;
        occupiedSlots += s._count.assinaturas;
    });

    const occupationRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    // 4. Inadimplência (Percentage of subscriptions with overdue charges)
    const totalAssinaturas = await prisma.assinatura.count({
        where: { streaming: { contaId } },
    });

    const agora = new Date();
    const overdueAssinaturas = await prisma.assinatura.count({
        where: {
            streaming: { contaId },
            cobrancas: {
                some: {
                    status: { in: ["pendente", "atrasado"] },
                    periodoFim: { lt: agora }
                }
            }
        },
    });

    const defaultRate = totalAssinaturas > 0 ? (overdueAssinaturas / totalAssinaturas) * 100 : 0;

    // 5. Get Currency Preference
    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { moedaPreferencia: true }
    });

    return {
        monthlyRevenue,
        activeParticipantsCount,
        occupationRate,
        defaultRate,
        currencyCode: conta?.moedaPreferencia || 'BRL',
        totalSlots,
        occupiedSlots,
        activeStreamingsCount: streamings.length,
        averageTicket: activeParticipantsCount > 0 ? monthlyRevenue / activeParticipantsCount : 0
    };
}

export async function getRecentSubscriptions() {
    const { contaId } = await getContext();

    const subscriptions = await prisma.assinatura.findMany({
        where: {
            streaming: { contaId },
        },
        include: {
            participante: true,
            streaming: {
                include: {
                    catalogo: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return subscriptions;
}

export async function getDashboardStreamings() {
    const { contaId } = await getContext();

    return prisma.streaming.findMany({
        where: { contaId, isAtivo: true },
        include: {
            catalogo: true,
            _count: {
                select: {
                    assinaturas: {
                        where: {
                            status: "ativa"
                        }
                    }
                },
            },
        },
        orderBy: { catalogo: { nome: "asc" } },
        take: 3,
    });
}
