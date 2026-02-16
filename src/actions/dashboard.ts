"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import {
    DashboardStats,
    FinancialMetrics,
    MembershipMetrics,
    OccupancyMetrics,
    PaymentMetrics,
    RevenueHistory,
    ParticipantStats,
    ParticipantSubscription
} from "@/types/dashboard.types";

/**
 * Funções auxiliares modulares (SOLID - Single Responsibility)
 */

async function getFinancialMetrics(contaId: number, agora: Date): Promise<FinancialMetrics> {
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

    // Receita Atual
    const activeSubVals = await prisma.assinatura.findMany({
        where: { streaming: { contaId }, status: "ativa" },
        select: { valor: true, streaming: { select: { valorIntegral: true } } }
    });

    const monthlyRevenue = activeSubVals.reduce((sum, sub) => sum + sub.valor.toNumber(), 0);
    const totalSavings = activeSubVals.reduce((sum, sub) => sum + (sub.streaming.valorIntegral.toNumber() - sub.valor.toNumber()), 0);

    // Receita Mês Anterior
    const paidLastMonth = await prisma.cobranca.aggregate({
        where: {
            assinatura: { streaming: { contaId } },
            status: "pago",
            dataPagamento: { gte: inicioMesAnterior, lte: fimMesAnterior }
        },
        _sum: { valor: true }
    });

    const lastMonthRevenue = paidLastMonth._sum.valor?.toNumber() || 0;
    const revenueTrend = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

    // Custo de Mercado
    const activeStreamings = await prisma.streaming.findMany({
        where: { contaId, isAtivo: true },
        select: { valorIntegral: true }
    });
    const totalMarketCost = activeStreamings.reduce((sum, s) => sum + s.valorIntegral.toNumber(), 0);

    // Participantes para Ticket Médio
    const activeParticipantsCount = await prisma.participante.count({
        where: { contaId, status: "ativo", assinaturas: { some: { status: "ativa" } } }
    });

    return {
        monthlyRevenue,
        revenueTrend,
        totalMarketCost,
        totalSavings,
        netBalance: monthlyRevenue - totalMarketCost,
        averageTicket: activeParticipantsCount > 0 ? monthlyRevenue / activeParticipantsCount : 0
    };
}

async function getMembershipMetrics(contaId: number, agora: Date): Promise<MembershipMetrics> {
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const activeParticipantsCount = await prisma.participante.count({
        where: {
            contaId,
            status: "ativo",
            assinaturas: { some: { status: "ativa" } }
        }
    });

    const participantsPrevCount = await prisma.participante.count({
        where: {
            contaId,
            status: "ativo",
            createdAt: { lt: inicioMesAtual },
            assinaturas: { some: { status: "ativa", createdAt: { lt: inicioMesAtual } } }
        }
    });

    return {
        activeParticipantsCount,
        participantsTrend: activeParticipantsCount - participantsPrevCount
    };
}

async function getOccupancyMetrics(contaId: number): Promise<OccupancyMetrics> {
    const streamings = await prisma.streaming.findMany({
        where: { contaId, isAtivo: true },
        select: {
            limiteParticipantes: true,
            _count: { select: { assinaturas: { where: { status: "ativa" } } } }
        }
    });

    let totalSlots = 0;
    let occupiedSlots = 0;

    streamings.forEach((s) => {
        totalSlots += s.limiteParticipantes;
        occupiedSlots += s._count.assinaturas;
    });

    return {
        totalSlots,
        occupiedSlots,
        occupationRate: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0,
        activeStreamingsCount: streamings.length
    };
}

async function getPaymentMetrics(contaId: number, agora: Date): Promise<PaymentMetrics> {
    const noventaDiasAtras = new Date();
    noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

    const [totalAssinaturas, overdueCobrancas, statusGroups] = await Promise.all([
        prisma.assinatura.count({ where: { streaming: { contaId }, status: "ativa" } }),
        prisma.cobranca.count({
            where: {
                assinatura: { streaming: { contaId }, status: "ativa" },
                status: { in: ["pendente", "atrasado"] },
                periodoFim: { lt: agora }
            }
        }),
        prisma.cobranca.groupBy({
            by: ['status'],
            where: {
                assinatura: { streaming: { contaId } },
                createdAt: { gte: noventaDiasAtras }
            },
            _count: { _all: true }
        })
    ]);

    const statusColors: Record<string, string> = {
        pago: '#10b981',
        atrasado: '#ef4444',
        pendente: '#f59e0b',
        cancelado: '#9ca3af'
    };

    return {
        defaultRate: totalAssinaturas > 0 ? (overdueCobrancas / totalAssinaturas) * 100 : 0,
        paymentStatusData: statusGroups.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: item._count._all,
            color: statusColors[item.status] || '#cbd5e1'
        }))
    };
}

async function getCatalogRevenue(contaId: number) {
    const revenueByCatalog = await prisma.assinatura.findMany({
        where: { streaming: { contaId }, status: "ativa" },
        select: {
            valor: true,
            streaming: { select: { catalogo: { select: { nome: true, corPrimaria: true } } } }
        }
    });

    const catalogMap = new Map();
    revenueByCatalog.forEach(sub => {
        const { nome: name, corPrimaria: color } = sub.streaming.catalogo;
        const current = catalogMap.get(name) || { name, value: 0, color };
        current.value += sub.valor.toNumber();
        catalogMap.set(name, current);
    });

    return Array.from(catalogMap.values());
}

/**
 * Public Actions (Server Actions)
 */

export async function getDashboardStats(): Promise<DashboardStats> {
    const { contaId } = await getContext();
    const agora = new Date();

    const [
        financial,
        membership,
        occupancy,
        payments,
        catalogs,
        conta
    ] = await Promise.all([
        getFinancialMetrics(contaId, agora),
        getMembershipMetrics(contaId, agora),
        getOccupancyMetrics(contaId),
        getPaymentMetrics(contaId, agora),
        getCatalogRevenue(contaId),
        prisma.conta.findUnique({ where: { id: contaId }, select: { moedaPreferencia: true } })
    ]);

    return {
        financial,
        membership,
        occupancy,
        payments,
        catalogs,
        currencyCode: conta?.moedaPreferencia || 'BRL'
    };
}

export async function getRevenueHistory(): Promise<RevenueHistory[]> {
    const { contaId } = await getContext();
    const agora = new Date();
    const seisMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 5, 1);

    const [cobrancas, novasAssinaturas] = await Promise.all([
        prisma.cobranca.findMany({
            where: {
                assinatura: { streaming: { contaId } },
                status: "pago",
                dataPagamento: { gte: seisMesesAtras }
            },
            select: {
                valor: true,
                dataPagamento: true,
                assinatura: { select: { participanteId: true } }
            },
            orderBy: { dataPagamento: 'asc' }
        }),
        prisma.assinatura.findMany({
            where: {
                streaming: { contaId },
                createdAt: { gte: seisMesesAtras }
            },
            select: { createdAt: true }
        })
    ]);

    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const historyMap = new Map();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        historyMap.set(key, { name: mesesLabels[d.getMonth()], receita: 0, participantes: new Set(), novosMembros: 0 });
    }

    cobrancas.forEach(c => {
        if (!c.dataPagamento) return;
        const key = `${c.dataPagamento.getFullYear()}-${c.dataPagamento.getMonth()}`;
        const data = historyMap.get(key);
        if (data) {
            data.receita += c.valor.toNumber();
            data.participantes.add(c.assinatura.participanteId);
        }
    });

    novasAssinaturas.forEach(a => {
        const key = `${a.createdAt.getFullYear()}-${a.createdAt.getMonth()}`;
        const data = historyMap.get(key);
        if (data) data.novosMembros += 1;
    });

    return Array.from(historyMap.values()).map(item => ({
        ...item,
        participantes: item.participantes.size
    }));
}

export async function getRecentSubscriptions() {
    const { contaId } = await getContext();

    return prisma.assinatura.findMany({
        where: { streaming: { contaId } },
        include: {
            participante: true,
            streaming: { include: { catalogo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });
}

export async function getDashboardStreamings() {
    const { contaId } = await getContext();

    return prisma.streaming.findMany({
        where: { contaId, isAtivo: true },
        include: {
            catalogo: true,
            _count: {
                select: { assinaturas: { where: { status: "ativa" } } }
            },
        },
        orderBy: { catalogo: { nome: "asc" } },
        take: 3,
    });
}

export async function getParticipantStats(): Promise<ParticipantStats> {
    const { userId } = await getContext();
    const agora = new Date();

    const assinaturas = await prisma.assinatura.findMany({
        where: {
            participante: { userId },
            status: "ativa"
        },
        include: {
            streaming: true,
            cobrancas: {
                where: { status: "pendente", dataVencimento: { gte: agora } },
                orderBy: { dataVencimento: "asc" },
                take: 1
            }
        }
    });

    const activeSubscriptions = assinaturas.length;
    const monthlySpending = assinaturas.reduce((sum, sub) => sum + sub.valor.toNumber(), 0);
    const totalSavings = assinaturas.reduce((sum, sub) => sum + (sub.streaming.valorIntegral.toNumber() - sub.valor.toNumber()), 0);

    const nextPaymentDates = assinaturas
        .map(sub => sub.cobrancas[0]?.dataVencimento)
        .filter(Boolean) as Date[];

    const nextPaymentDate = nextPaymentDates.length > 0
        ? new Date(Math.min(...nextPaymentDates.map(d => d.getTime())))
        : null;

    const conta = await prisma.contaUsuario.findFirst({
        where: { usuarioId: userId },
        include: { conta: { select: { moedaPreferencia: true } } }
    });

    return {
        activeSubscriptions,
        monthlySpending,
        totalSavings,
        nextPaymentDate,
        currencyCode: conta?.conta.moedaPreferencia || 'BRL'
    };
}

export async function getParticipantSubscriptions(): Promise<ParticipantSubscription[]> {
    const { userId } = await getContext();
    const agora = new Date();

    const assinaturas = await prisma.assinatura.findMany({
        where: {
            participante: { userId },
            status: { in: ["ativa", "suspensa"] }
        },
        include: {
            streaming: {
                include: { catalogo: true }
            },
            cobrancas: {
                where: { status: "pendente", dataVencimento: { gte: agora } },
                orderBy: { dataVencimento: "asc" },
                take: 1
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return assinaturas.map(sub => ({
        id: sub.id,
        streamingId: sub.streamingId,
        streamingName: sub.streaming.apelido || sub.streaming.catalogo.nome,
        streamingLogo: sub.streaming.catalogo.iconeUrl,
        streamingColor: sub.streaming.catalogo.corPrimaria,
        status: sub.status,
        valor: sub.valor.toNumber(),
        valorIntegral: sub.streaming.valorIntegral.toNumber(),
        proximoVencimento: sub.cobrancas[0]?.dataVencimento || null,
        credenciaisLogin: sub.status === "ativa" ? sub.streaming.credenciaisLogin : null,
        credenciaisSenha: sub.status === "ativa" ? sub.streaming.credenciaisSenha : null,
    }));
}
