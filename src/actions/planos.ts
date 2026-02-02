"use server";

import { prisma } from "@/lib/db";
import { PlanoConta } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PLANS } from "@/config/plans";

import { getStripeUrl, stripe } from "@/lib/stripe";

export async function createCheckoutSession(plano: PlanoConta) {
    const session = await getCurrentUser();
    if (!session) {
        throw new Error("Não autenticado");
    }

    const planConfig = PLANS[plano];
    if (!planConfig) {
        throw new Error("Plano inválido");
    }

    if (!planConfig.stripePriceId) {
        if (planConfig.price === 0) {
            // Free plan logic (downgrade/cancel logic if needed, or just simple internal update)
            // For now, let's just update internally for free plan or throw error
            return internalUpdateToFree(session.userId, plano);
        }
        throw new Error("Configuração de preço ausente para este plano");
    }

    // Get Account
    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
        include: { conta: true },
    });

    if (!userAccount) {
        throw new Error("Conta não encontrada ou sem permissão de dono");
    }

    const { conta } = userAccount;

    // Create Stripe Session
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: conta.stripeCustomerId || undefined,
        line_items: [
            {
                price: planConfig.stripePriceId,
                quantity: 1,
            },
        ],
        metadata: {
            contaId: conta.id.toString(),
            plano: plano,
        },
        success_url: getStripeUrl("/planos?success=true"),
        cancel_url: getStripeUrl("/planos?canceled=true"),
    });

    if (!checkoutSession.url) {
        throw new Error("Erro ao criar sessão de checkout");
    }

    return { url: checkoutSession.url };
}

async function internalUpdateToFree(userId: number, plano: PlanoConta) {
    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: userId, isAtivo: true, nivelAcesso: "owner" },
        select: { contaId: true },
    });

    if (!userAccount) return { error: "Conta não encontrada" };

    const planConfig = PLANS[plano];

    await prisma.conta.update({
        where: { id: userAccount.contaId },
        data: {
            plano: plano,
            limiteGrupos: planConfig.maxGrupos,
            stripeSubscriptionStatus: 'active', // Free is always active
        }
    });

    revalidatePath("/planos");
    return { success: true };
}

export async function createCustomerPortalSession() {
    const session = await getCurrentUser();
    if (!session) {
        throw new Error("Não autenticado");
    }

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
        include: { conta: true },
    });

    if (!userAccount || !userAccount.conta.stripeCustomerId) {
        throw new Error("Conta não encontrada ou sem ID Stripe");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: userAccount.conta.stripeCustomerId,
        return_url: getStripeUrl("/dashboard"),
    });

    return { url: portalSession.url };
}
