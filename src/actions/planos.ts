"use server";

import { prisma } from "@/lib/db";
import { PlanoConta } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PLANS } from "@/config/plans";

import { getStripeUrl, stripe } from "@/lib/stripe";

export async function createCheckoutSession(plano: PlanoConta) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };
        }

        const planConfig = PLANS[plano];
        if (!planConfig) {
            return { success: false, error: "Plano inválido" };
        }

        if (!planConfig.stripePriceId) {
            if (planConfig.price === 0) {
                // Free plan logic (downgrade/cancel logic if needed, or just simple internal update)
                // For now, let's just update internally for free plan or throw error
                return internalUpdateToFree(session.userId, plano);
            }
            return { success: false, error: "Configuração de preço ausente para este plano" };
        }

        // Get Account
        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
            include: { conta: true },
        });

        if (!userAccount) {
            return { success: false, error: "Conta não encontrada ou sem permissão de dono", code: "FORBIDDEN" };
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
            return { success: false, error: "Erro ao criar sessão de checkout" };
        }

        return { success: true, data: { url: checkoutSession.url } };
    } catch (error: any) {
        console.error("[CREATE_CHECKOUT_SESSION_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar sessão de checkout" };
    }
}

async function internalUpdateToFree(userId: number, plano: PlanoConta) {
    try {
        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: userId, isAtivo: true, nivelAcesso: "owner" },
            select: { contaId: true },
        });

        if (!userAccount) return { success: false, error: "Conta não encontrada" };

        await prisma.conta.update({
            where: { id: userAccount.contaId },
            data: {
                plano: plano,
                stripeSubscriptionStatus: 'active', // Free is always active
            }
        });

        revalidatePath("/planos");
        return { success: true };
    } catch (error: any) {
        console.error("[INTERNAL_UPDATE_TO_FREE_ERROR]", error);
        return { success: false, error: "Erro ao atualizar para plano gratuito" };
    }
}

export async function createCustomerPortalSession() {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };
        }

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
            include: { conta: true },
        });

        if (!userAccount || !userAccount.conta.stripeCustomerId) {
            return { success: false, error: "Conta não encontrada ou sem ID Stripe", code: "NOT_FOUND" };
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: userAccount.conta.stripeCustomerId,
            return_url: getStripeUrl("/dashboard"),
        });

        return { success: true, data: { url: portalSession.url } };
    } catch (error: any) {
        console.error("[CREATE_CUSTOMER_PORTAL_SESSION_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar sessão de portal do cliente" };
    }
}
