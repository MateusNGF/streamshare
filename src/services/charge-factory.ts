import { FrequenciaPagamento, Prisma } from "@prisma/client";
import {
    escolherProximoDiaVencimento,
    calcularDataVencimentoPadrao,
    calcularProximoVencimento,
    calcularValorProRata,
    calcularValorPeriodo,
    gerarCiclosRetroativos
} from "@/lib/financeiro-utils";
import { startOfDay } from "date-fns";

export interface ChargeData {
    assinaturaId: number;
    valor: Prisma.Decimal | number;
    periodoInicio: Date;
    periodoFim: Date;
    status: "pago" | "pendente";
    dataPagamento: Date | null;
    dataVencimento: Date;
    gatewayTransactionId: string | null;
}

export const chargeFactory = {
    /**
     * Creates data for the initial charge of a standard (non-retroactive) subscription.
     */
    createInitialChargeData: (params: {
        assinaturaId: number;
        valorMensal: number | Prisma.Decimal;
        frequencia: FrequenciaPagamento;
        dataInicio: Date;
        diasVencimento: number[];
        isPaid: boolean;
        manualMigration?: boolean;
    }): ChargeData => {
        const { assinaturaId, valorMensal, frequencia, dataInicio, diasVencimento, isPaid, manualMigration } = params;
        const hojeMidnight = startOfDay(new Date());

        const isFixarVencimento = diasVencimento && diasVencimento.length > 0;
        const dataVencimento = isFixarVencimento
            ? escolherProximoDiaVencimento(diasVencimento, dataInicio)
            : calcularDataVencimentoPadrao(dataInicio);

        const periodoFim = isFixarVencimento
            ? dataVencimento
            : calcularProximoVencimento(dataInicio, frequencia, dataInicio);

        const valorCobranca = isFixarVencimento
            ? calcularValorProRata(valorMensal, dataInicio, dataVencimento)
            : calcularValorPeriodo(valorMensal, frequencia);

        const pagamentoIdeal = dataVencimento < hojeMidnight ? dataVencimento : hojeMidnight;

        return {
            assinaturaId,
            valor: valorCobranca,
            periodoInicio: dataInicio,
            periodoFim,
            status: isPaid ? "pago" : "pendente",
            dataPagamento: isPaid ? pagamentoIdeal : null,
            dataVencimento,
            gatewayTransactionId: manualMigration ? "manual_migration" : null
        };
    },

    /**
     * Creates a list of charge data for retroactive periods.
     */
    createRetroactiveChargesData: (params: {
        assinaturaId: number;
        dataInicio: Date;
        frequencia: FrequenciaPagamento;
        valorMensal: number | Prisma.Decimal;
        diasVencimento: number[];
        paidIndices: number[];
    }): ChargeData[] => {
        const { assinaturaId, dataInicio, frequencia, valorMensal, diasVencimento, paidIndices } = params;
        const hojeMidnight = startOfDay(new Date());

        const ciclos = gerarCiclosRetroativos({
            dataInicio,
            frequencia,
            valorMensal,
            diasVencimento
        });

        return ciclos.map((ciclo, index) => {
            const isPaid = paidIndices.includes(index);
            const pagamentoIdeal = ciclo.dataVencimento < hojeMidnight ? ciclo.dataVencimento : hojeMidnight;

            return {
                assinaturaId,
                valor: ciclo.valor,
                periodoInicio: ciclo.periodoInicio,
                periodoFim: ciclo.periodoFim,
                status: isPaid ? "pago" : "pendente",
                dataPagamento: isPaid ? pagamentoIdeal : null,
                dataVencimento: ciclo.dataVencimento,
                gatewayTransactionId: isPaid ? "manual_migration" : null
            };
        });
    },

    /**
     * Creates data for a renewal charge (next cycle).
     */
    createRenewalChargeData: (params: {
        assinaturaId: number;
        valorMensal: number | Prisma.Decimal;
        frequencia: FrequenciaPagamento;
        periodoInicio: Date;
        dataInicioAssinatura: Date;
        diasVencimento: number[];
        referenciaVencimento: Date; // usually 'agora' or 'periodoInicio'
    }): ChargeData => {
        const { assinaturaId, valorMensal, frequencia, periodoInicio, dataInicioAssinatura, diasVencimento, referenciaVencimento } = params;

        const periodoFim = calcularProximoVencimento(periodoInicio, frequencia, dataInicioAssinatura);
        const valorCobranca = calcularValorPeriodo(valorMensal, frequencia);

        const dataVencimento = diasVencimento.length > 0
            ? escolherProximoDiaVencimento(diasVencimento, referenciaVencimento)
            : calcularDataVencimentoPadrao(referenciaVencimento);

        return {
            assinaturaId,
            valor: valorCobranca,
            periodoInicio,
            periodoFim,
            status: "pendente",
            dataPagamento: null,
            dataVencimento,
            gatewayTransactionId: null
        };
    }
};
