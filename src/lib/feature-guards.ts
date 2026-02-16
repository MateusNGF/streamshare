import { PlanoConta } from "@prisma/client";
import { PLANS } from "@/config/plans";

export type FeatureKey =
    | "streaming_creation"
    | "manual_billing"
    | "automatic_billing"
    | "whatsapp_integration"
    | "priority_support"
    | "custom_branding"
    | "dashboard_analytics";

export interface FeatureCheck {
    enabled: boolean;
    reason?: string;
    requiredPlan?: PlanoConta;
}

/**
 * Centrally manages feature availability based on the user's plan.
 */
export const FeatureGuards = {
    /**
     * Checks if a specific feature is enabled for a given plan.
     */
    isFeatureEnabled(plan: PlanoConta, feature: FeatureKey): FeatureCheck {
        const planConfig = PLANS[plan];

        switch (feature) {
            case "streaming_creation":
                return {
                    enabled: planConfig.maxStreamings > 0,
                    reason: "O plano gratuito não permite a criação de streamings.",
                    requiredPlan: PlanoConta.pro
                };

            case "manual_billing":
                return {
                    enabled: plan !== PlanoConta.free,
                    reason: "A gestão de cobranças está disponível a partir do plano Pro.",
                    requiredPlan: PlanoConta.pro
                };

            case "automatic_billing":
            case "whatsapp_integration":
                return {
                    enabled: plan === PlanoConta.business,
                    reason: "Este recurso é exclusivo do plano Business.",
                    requiredPlan: PlanoConta.business
                };

            case "priority_support":
                return {
                    enabled: plan !== PlanoConta.free,
                    reason: "O suporte prioritário está disponível nos planos Pro e Business.",
                    requiredPlan: PlanoConta.pro
                };

            case "dashboard_analytics":
                return {
                    enabled: true, // For now, allow everyone to see dashboard, but maybe restrict data depth later
                    reason: "Analytics está disponível para todos os usuários."
                };

            default:
                return { enabled: false, reason: "Recurso não reconhecido." };
        }
    },

    /**
     * Checks if the user has reached their limit for a specific feature.
     */
    async checkLimit(plan: PlanoConta, feature: "max_streamings", currentCount: number): Promise<FeatureCheck> {
        const planConfig = PLANS[plan];

        if (feature === "max_streamings") {
            if (currentCount >= planConfig.maxStreamings) {
                return {
                    enabled: false,
                    reason: `Você atingiu o limite de ${planConfig.maxStreamings} streamings do seu plano.`,
                    requiredPlan: plan === PlanoConta.pro ? PlanoConta.business : PlanoConta.pro
                };
            }
        }

        return { enabled: true };
    },

    /**
     * Returns the next available plan that unlocks a specific feature.
     */
    getRequiredPlan(feature: FeatureKey): PlanoConta {
        if (feature === "automatic_billing" || feature === "whatsapp_integration") {
            return PlanoConta.business;
        }
        return PlanoConta.pro;
    }
};
