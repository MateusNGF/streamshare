import { FrequenciaPagamento, Prisma, StatusAssinatura } from "@prisma/client";

export interface CreateSubscriptionDTO {
    participanteId: number;
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: number;
    dataInicio: string | Date;
    cobrancaAutomaticaPaga?: boolean;
}

export interface BulkCreateSubscriptionDTO {
    participanteIds: number[];
    assinaturas: Array<{
        streamingId: number;
        frequencia: FrequenciaPagamento;
        valor: number;
    }>;
    dataInicio: string | Date;
    cobrancaAutomaticaPaga?: boolean;
}

export interface ChargeCreationData {
    assinaturaId: number;
    valor: Prisma.Decimal;
    periodoInicio: Date;
    periodoFim: Date;
}

export type BillingDecision =
    | { action: 'NONE' }
    | { action: 'CANCEL_SCHEDULED' }
    | { action: 'CREATE_CHARGE'; data: ChargeCreationData };

export interface SubscriptionWithCharges {
    id: number;
    participanteId: number;
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: Prisma.Decimal;
    dataInicio: Date;
    dataCancelamento: Date | null;
    status: StatusAssinatura;
    cobrancaAutomaticaPaga: boolean;
    cobrancas: {
        id: number;
        periodoFim: Date;
        status: string;
    }[];
    participante: {
        contaId: number;
        nome: string;
        userId?: number | null;
    };
}
