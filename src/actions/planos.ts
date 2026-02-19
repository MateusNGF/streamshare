"use server";

import { prisma } from "@/lib/db";
import { PlanoConta } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { PLANS } from "@/config/plans";
import { createSaaSSubscription, cancelSaaSSubscription, reactivateSaaSSubscription, getSaaSSubscription } from "@/lib/mercado-pago";
import { getContext } from "@/lib/action-context";

export async function createCheckoutSession(plano: PlanoConta) {
    try {
        const { userId, contaId, userEmail } = await getContext();

        const planConfig = PLANS[plano];
        if (!planConfig) {
            return { success: false, error: "Plano inválido" };
        }

        if (!planConfig.mpPlanId) {
            if (planConfig.price === 0) {
                return internalUpdateToFree(userId, contaId, plano);
            }
            return { success: false, error: "Configuração de preço ausente para este plano" };
        }

        // Fetch account details
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { id: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        const subscription = await createSaaSSubscription(
            planConfig.mpPlanId,
            userEmail,
            `saas_${conta.id}_${plano}`
        );

        if (!subscription.success || !subscription.init_point) {
            return { success: false, error: subscription.error || "Erro ao criar assinatura" };
        }

        return { success: true, data: { url: subscription.init_point } };
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
                gatewaySubscriptionStatus: 'active',
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
        // MercadoPago pre-approvals can be managed by the user in their MP account.
        // For now, we return a link to the MercadoPago dashboard or a custom page.
        return {
            success: true,
            data: { url: "https://www.mercadopago.com.br/subscriptions" }
        };
    } catch (error: any) {
        console.error("[CREATE_CUSTOMER_PORTAL_SESSION_ERROR]", error);
        return { success: false, error: "Erro ao direcionar para o portal financeiro" };
    }
}

export async function cancelSubscriptionAction() {
    try {
        const { contaId } = await getContext();
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { gatewaySubscriptionId: true }
        });

        if (!conta?.gatewaySubscriptionId) {
            return { success: false, error: "Assinatura não encontrada" };
        }

        const result = await cancelSaaSSubscription(conta.gatewaySubscriptionId);
        if (result.success) {
            await prisma.conta.update({
                where: { id: contaId },
                data: { gatewaySubscriptionStatus: 'cancelled' }
            });
            revalidatePath("/configuracoes");
        }
        return result;
    } catch (error: any) {
        return { success: false, error: "Erro ao processar cancelamento" };
    }
}

export async function reactivateSubscriptionAction() {
    try {
        const { contaId } = await getContext();
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { gatewaySubscriptionId: true }
        });

        if (!conta?.gatewaySubscriptionId) {
            return { success: false, error: "Assinatura não encontrada" };
        }

        const result = await reactivateSaaSSubscription(conta.gatewaySubscriptionId);
        if (result.success) {
            await prisma.conta.update({
                where: { id: contaId },
                data: { gatewaySubscriptionStatus: 'authorized' }
            });
            revalidatePath("/configuracoes");
        }
        return result;
    } catch (error: any) {
        return { success: false, error: "Erro ao processar reativação" };
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

export async function verifySaaSSubscriptionAction(preapprovalId: string) {
    try {
        const { contaId } = await getContext();

        // 1. Verificar no banco se já foi atualizado pelo webhook
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { gatewaySubscriptionId: true, plano: true }
        });

        if (conta?.gatewaySubscriptionId === preapprovalId && conta.plano !== PlanoConta.free) {
            return { success: true, alreadyUpdated: true };
        }

        // 2. Buscar no Mercado Pago para garantir autenticidade
        const result = await getSaaSSubscription(preapprovalId);
        if (!result.success || !result.data) {
            return { success: false, error: result.error || "Assinatura não encontrada no gateway" };
        }

        console.log("Assinatura encontrada no gateway:", result.data);

        const preApproval = result.data;
        const mpPlanId = (preApproval as any)?.preapproval_plan_id


        if (!mpPlanId) {
            return { success: false, error: "Não foi possível identificar o plano desta assinatura" };
        }

        const planEntry = Object.entries(PLANS).find(([_, p]) => p.mpPlanId === mpPlanId)?.[1];

        if (!planEntry) {
            return { success: false, error: "Não foi possível identificar o plano desta assinatura; entre em contato com o suporte." };
        }

        // 5. Se autorizada/ativa, atualizar no banco imediatamente
        if (preApproval.status && ['authorized', 'active'].includes(preApproval.status as string)) {
            await prisma.conta.update({
                where: { id: contaId },
                data: {
                    gatewaySubscriptionId: preapprovalId,
                    gatewaySubscriptionStatus: preApproval.status as string,
                    plano: planEntry.id
                }
            });

            revalidatePath("/planos");
            revalidatePath("/configuracoes");
            return { success: true, updated: true };
        }

        return { success: true, status: preApproval.status };

    } catch (error: any) {
        console.error("[VERIFY_SAAS_SUBSCRIPTION_ERROR]", error);
        return { success: false, error: "Erro ao verificar assinatura" };
    }
}
