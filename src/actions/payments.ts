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
        },
        orderBy: { dataInicio: "asc" },
    });

    // Calculate billing stats
    const totalToReceive = assinaturas.reduce((sum, sub) => sum + sub.valor.toNumber(), 0);
    const received = assinaturas
        .filter((sub) => sub.status === "ativa" && sub.diasAtraso === 0)
        .reduce((sum, sub) => sum + sub.valor.toNumber(), 0); // Simplified: assuming active/no delay means paid for this month
    const pending = assinaturas
        .filter((sub) => sub.status === "ativa" && sub.diasAtraso === 0) // Placeholder logic for pending
        .reduce((sum, sub) => sum + sub.valor.toNumber(), 0);
    const overdue = assinaturas
        .filter((sub) => sub.diasAtraso > 0)
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
