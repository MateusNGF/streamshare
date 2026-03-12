import { FrequenciaPagamento } from "@prisma/client";

export interface BillingCycle {
    periodoInicio: Date;
    periodoFim: Date;
    dataVencimento: Date;
    valor: number;
    tipo?: string;
}

export interface Projection extends BillingCycle {
    streaming: string;
    streamingId: number;
    cor: string;
    iconeUrl?: string | null;
    index: number;
    periodo: string; // Formatted string for UI
    vencimento: string; // Formatted string for UI
}

export interface FinancialAnalysisResult {
    receitaMensalTotal: number;
    custoMensalTotal: number;
    lucroLiquidoMensal: number;
    totalProximaFatura: number;
    margemLucro: number;
    totalAssinaturas: number;
    isPastDate: boolean;
    proximoVencimento: Date | string | null;
    valorTotalLancamento: number;
    cobrancasProjetadas: Projection[];
}
