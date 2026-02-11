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
    dataVencimento: Date;
}

export type BillingDecision =
    | { action: 'NONE' }
    | { action: 'CANCEL_SCHEDULED' }
    | { action: 'SUSPEND' }
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
    motivoCancelamento: string | null;
    canceladoPorId: number | null;
    createdAt: Date;
    updatedAt: Date;
    cobrancas: {
        id: number;
        assinaturaId: number;
        valor: Prisma.Decimal;
        periodoInicio: Date;
        periodoFim: Date;
        status: string;
        dataVencimento: Date | null;
        gatewayTransactionId: string | null;
        gatewayProvider: string | null;
        tentativas: number;
        metadataJson: any | null;
        deletedAt: Date | null;
    }[];
    participante: {
        id: number;
        contaId: number;
        nome: string;
        whatsappNumero: string | null;
        userId?: number | null;
    };
    streaming: {
        id: number;
        apelido: string | null;
        catalogo: {
            nome: string;
            iconeUrl: string | null;
            corPrimaria: string | null;
        };
    };
    canceladoPor?: {
        id: number;
        name: string | null;
        email: string | null;
    } | null;
}
