"use server";

import { prisma } from "@/lib/db";


import { getContext } from "@/lib/action-context";

export async function getPaymentsData() {
    const { contaId } = await getContext();

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

    const agora = new Date();

    // Calculate billing stats
    const totalToReceive = assinaturas.reduce((sum, sub) => sum + sub.valor.toNumber(), 0);

    // received: subscriptions where the latest charge is paid and covers 'today'
    const received = assinaturas
        .filter((sub) =>
            sub.status === "ativa" &&
            sub.cobrancas.some(c => c.status === "pago" && c.periodoInicio <= agora && c.periodoFim >= agora)
        )
        .reduce((sum, sub) => sum + sub.valor.toNumber(), 0);

    // pending: active subscriptions with a pending charge that hasn't expired yet
    const pending = assinaturas
        .filter((sub) =>
            sub.status === "ativa" &&
            sub.cobrancas.some(c => c.status === "pendente" && c.periodoFim >= agora)
        )
        .reduce((sum, sub) => sum + sub.valor.toNumber(), 0);

    // overdue: any subscription with at least one pending or overdue charge past its due date
    const overdue = assinaturas
        .filter((sub) =>
            sub.cobrancas.some(c => (c.status === "pendente" || c.status === "atrasado") && c.periodoFim < agora)
        )
        .reduce((sum, sub) => sum + sub.valor.toNumber(), 0);

    return {
        assinaturas,
        stats: {
            totalToReceive,
            received,
            pending,
            overdue,
        },
    };
}
