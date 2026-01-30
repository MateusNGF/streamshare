import { PlanoConta } from "@streamshare/database";

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
    maxGrupos: number;
    maxParticipantes: number;

    features: PlanFeature[];
    highlighted?: boolean;
    color: string;
    stripePriceId?: string;
}

export const PLANS: Record<PlanoConta, PlanDefinition> = {
    [PlanoConta.basico]: {
        id: PlanoConta.basico,
        label: "Básico",
        description: "Para quem está começando.",
        subDescription: "Gerencie poucos grupos",
        price: 0,

        maxStreamings: 1,
        maxGrupos: 1,
        maxParticipantes: 6,

        color: "gray",
        // No price ID for free plan
        features: [
            { text: "1 Serviço de Streaming", included: true },
            { text: "Até 6 Participantes por serviço", included: true },
            { text: "1 Grupo de compartilhamento", included: true },
            { text: "Painel de Gestão Completo", included: true },
            { text: "Cobrança Manual", included: true },
        ],
    },
    [PlanoConta.pro]: {
        id: PlanoConta.pro,
        label: "Profissional",
        description: "Para administradores sérios.",
        subDescription: "Expanda sua operação",
        price: 29.90,

        maxStreamings: 9999, // Unlimited
        maxGrupos: 9999,    // Unlimited
        maxParticipantes: 9999, // Unlimited

        highlighted: true,
        color: "primary",
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO, // Env var
        features: [
            { text: "Streamings Ilimitados", included: true },
            { text: "Participantes Ilimitados", included: true },
            { text: "Grupos Ilimitados", included: true },
            { text: "Automação de WhatsApp", included: true },
            { text: "Cobranças Automáticas", included: true },
        ],
    },

};

export const PLANS_LIST = Object.values(PLANS);
