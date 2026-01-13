"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId };
}

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
        orderBy: { dataVencimento: "asc" },
    });

    // Calculate billing stats
    const totalToReceive = assinaturas.reduce((sum, sub) => sum + Number(sub.valor), 0);
    const received = assinaturas
        .filter((sub) => sub.status === "ativa" && sub.diasAtraso === 0)
        .reduce((sum, sub) => sum + Number(sub.valor), 0); // Simplified: assuming active/no delay means paid for this month
    const pending = assinaturas
        .filter((sub) => sub.status === "ativa" && sub.diasAtraso === 0) // Placeholder logic for pending
        .reduce((sum, sub) => sum + Number(sub.valor), 0);
    const overdue = assinaturas
        .filter((sub) => sub.diasAtraso > 0)
        .reduce((sum, sub) => sum + Number(sub.valor), 0);

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
