"use server";

import { prisma } from "@/lib/db";
import { PlanoConta } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { PLANS } from "@/config/plans";
import { getStripeUrl, stripe } from "@/lib/stripe";
import { getContext } from "@/lib/action-context";

export async function createCheckoutSession(plano: PlanoConta) {
    try {
        const { userId, contaId } = await getContext();

        const planConfig = PLANS[plano];
        if (!planConfig) {
            return { success: false, error: "Plano inválido" };
        }

        if (!planConfig.stripePriceId) {
            if (planConfig.price === 0) {
                return internalUpdateToFree(userId, contaId, plano);
            }
            return { success: false, error: "Configuração de preço ausente para este plano" };
        }

        // Fetch account details needed for stripe
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { stripeCustomerId: true, id: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: conta.stripeCustomerId || undefined,
            line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
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

async function internalUpdateToFree(userId: number, contaId: number, plano: PlanoConta) {
    try {
        await prisma.conta.update({
            where: { id: contaId },
            data: {
                plano: plano,
                stripeSubscriptionStatus: 'active',
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
        const { contaId } = await getContext();

        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { stripeCustomerId: true }
        });

        if (!conta || !conta.stripeCustomerId) {
            return { success: false, error: "ID Stripe não encontrado", code: "NOT_FOUND" };
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: conta.stripeCustomerId,
            return_url: getStripeUrl("/dashboard"),
        });

        return { success: true, data: { url: portalSession.url } };
    } catch (error: any) {
        console.error("[CREATE_CUSTOMER_PORTAL_SESSION_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar sessão de portal" };
    }
}

export async function getCurrentPlan() {
    try {
        const { contaId } = await getContext();

        const account = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!account) return { success: false, error: "Conta não encontrada" };

        return { success: true, data: account.plano };
    } catch (error: any) {
        console.error("[GET_CURRENT_PLAN_ERROR]", error);
        return { success: false, error: "Erro ao buscar plano atual" };
    }
}
