import { PlanoConta } from "@prisma/client";

export interface PlanFeature {
    text: string;
    included: boolean;
}

export interface PlanDefinition {
    id: PlanoConta;
    label: string;
    description: string;
    subDescription?: string;
    price: number;
    // Limits
    maxStreamings: number;

    automationEnabled: boolean;

    features: PlanFeature[];
    highlighted?: boolean;
    comingSoon?: boolean;
    color: string;
    mpPlanId?: string;
}

export const PLANS: Record<PlanoConta, PlanDefinition> = {
    [PlanoConta.free]: {
        id: PlanoConta.free,
        label: "Free",
        description: "Participe de grupos.",
        subDescription: "Sem gestão de streamings",
        price: 0,

        maxStreamings: 0,

        automationEnabled: false,

        color: "gray",
        features: [
            { text: "Participação Ilimitada", included: true },
            { text: "Sem gestão de streamings", included: true },
            { text: "Sem gestão de cobranças", included: false },
        ],
    },

    [PlanoConta.pro]: {
        id: PlanoConta.pro,
        label: "Pro",
        description: "Para gestores.",
        subDescription: "Gerencie até 20 streamings",
        price: 29.90,

        maxStreamings: 20,

        automationEnabled: false,

        highlighted: true,
        color: "primary",
        mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_PRO,
        features: [
            { text: "20 Streamings", included: true },
            { text: "Participantes Ilimitados", included: true },
            { text: "Grupos Ilimitados", included: true },
            { text: "Cobrança Manual", included: true },
            { text: "Atendimento Prioritário", included: true },
            { text: "Sem Automação", included: false },
        ],
    },
    [PlanoConta.business]: {
        id: PlanoConta.business,
        label: "Business",
        description: "Automação total.",
        subDescription: "Streamings ilimitados e automação",
        price: 99.90, // Example price, user didn't specify.

        maxStreamings: 9999,

        automationEnabled: true,
        comingSoon: true,

        color: "purple", // Distinct color
        mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_BUSINESS,
        features: [
            { text: "Streamings Ilimitados", included: true },
            { text: "Participantes Ilimitados", included: true },
            { text: "Grupos Ilimitados", included: true },
            { text: "Cobrança Automática", included: true },
            { text: "Integração WhatsApp/Telegram", included: true },
        ],
    },
};

export const PLANS_LIST = Object.values(PLANS);
