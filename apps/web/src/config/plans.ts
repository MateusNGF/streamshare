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
    limiteGrupos: number;
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
        limiteGrupos: 5,
        color: "gray",
        // No price ID for free plan
        features: [
            { text: "Até 5 Grupos de Streaming", included: true },
            { text: "Painel de Gestão Completo", included: true },
            { text: "Cobrança Manual", included: true },
            { text: "Sem Integração de Pagamento Auto", included: false },
            { text: "Suporte Básico", included: true },
        ],
    },
    [PlanoConta.pro]: {
        id: PlanoConta.pro,
        label: "Profissional",
        description: "Para administradores sérios.",
        subDescription: "Expanda sua operação",
        price: 29.90,
        limiteGrupos: 20,
        highlighted: true,
        color: "primary",
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO, // Env var
        features: [
            { text: "Até 20 Grupos de Streaming", included: true },
            { text: "Automação de WhatsApp", included: true },
            { text: "Cobranças Automáticas", included: true },
            { text: "Relatórios Financeiros Avançados", included: true },
            { text: "Suporte Prioritário", included: true },
        ],
    },

};

export const PLANS_LIST = Object.values(PLANS);
