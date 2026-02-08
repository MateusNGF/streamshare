"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function cancelSubscriptionAction(contaId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Não autorizado");
        }

        const acesso = await prisma.contaUsuario.findFirst({
            where: {
                contaId: contaId,
                usuarioId: user.userId,
                nivelAcesso: { in: ["owner", "admin"] }
            }
        });

        if (!acesso) {
            throw new Error("Permissão negada");
        }

        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
        });

        if (!conta || !conta.stripeSubscriptionId) {
            throw new Error("Conta não encontrada ou sem assinatura ativa.");
        }

        const subscription = await stripe.subscriptions.update(
            conta.stripeSubscriptionId,
            {
                cancel_at_period_end: true,
            }
        );

        await prisma.$transaction(async (tx) => {
            await tx.conta.update({
                where: { id: contaId },
                data: {
                    stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });

            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: user.userId,
                    tipo: "assinatura_cancelada",
                    titulo: "Cancelamento Agendado",
                    descricao: "Sua assinatura foi agendada para cancelamento ao fim do período atual.",
                    metadata: { subscriptionId: subscription.id, cancelAt: subscription.cancel_at }
                }
            });
        });

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao cancelar assinatura:", error);
        return { success: false, error: error.message };
    }
}

export async function reactivateSubscriptionAction(contaId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Não autorizado");
        }

        const acesso = await prisma.contaUsuario.findFirst({
            where: {
                contaId: contaId,
                usuarioId: user.userId,
                nivelAcesso: { in: ["owner", "admin"] }
            }
        });

        if (!acesso) {
            throw new Error("Permissão negada");
        }

        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
        });

        if (!conta || !conta.stripeSubscriptionId) {
            throw new Error("Conta não encontrada ou sem assinatura.");
        }

        const subscription = await stripe.subscriptions.update(
            conta.stripeSubscriptionId,
            {
                cancel_at_period_end: false,
            }
        );

        await prisma.$transaction(async (tx) => {
            await tx.conta.update({
                where: { id: contaId },
                data: {
                    stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });

            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: user.userId,
                    tipo: "assinatura_renovada",
                    titulo: "Assinatura Reativada",
                    descricao: "Sua assinatura foi reativada e a renovação automática está habilitada.",
                    metadata: { subscriptionId: subscription.id }
                }
            });
        });

        revalidatePath("/configuracoes");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao reativar assinatura:", error);
        return { success: false, error: error.message };
    }
}
