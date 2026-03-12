import { Prisma, FrequenciaPagamento } from "@prisma/client";
import {
    calcularCustoBase,
    calcularTotalCiclo,
    escolherProximoDiaVencimento,
    calcularDataVencimentoPadrao,
    calcularValorProRata,
    parseLocalDate,
    gerarCiclosRetroativos,
    arredondarMoeda
} from "@/lib/financeiro-utils";
import { isBefore, startOfDay, format as formatDate } from "date-fns";
import { StreamingOption, SelectedStreaming } from "../components/modals/assinatura-multipla/types";
import { BillingCycle, Projection, FinancialAnalysisResult } from "@/types/financial.types";

/**
 * Creates a standard sequential generator for billing cycles.
 */
function getSubscriptionCycles(
    config: SelectedStreaming,
    dataInicioObj: Date,
    diasVencimento: number[],
    isPastDate: boolean
): BillingCycle[] {
    const valorCobrado = new Prisma.Decimal(config.valor || 0);
    const isFixarVencimento = diasVencimento.length > 0;

    if (isPastDate) {
        return gerarCiclosRetroativos({
            dataInicio: dataInicioObj,
            frequencia: config.frequencia as FrequenciaPagamento,
            valorMensal: valorCobrado,
            diasVencimento
        });
    }

    const dataVencObj = isFixarVencimento
        ? escolherProximoDiaVencimento(diasVencimento, dataInicioObj)
        : calcularDataVencimentoPadrao(dataInicioObj);

    const valor = isFixarVencimento
        ? calcularValorProRata(valorCobrado, dataInicioObj, dataVencObj)
        : calcularTotalCiclo(valorCobrado, config.frequencia as FrequenciaPagamento);

    return [{
        periodoInicio: dataInicioObj,
        periodoFim: dataVencObj,
        dataVencimento: dataVencObj,
        valor: valor.toNumber(),
        tipo: isFixarVencimento ? 'Pro-rata' : 'Primeira Mensalidade'
    }];
}

/**
 * Maps generic BillingCycles to UI-ready Projections.
 */
function mapToProjections(
    cycles: BillingCycle[],
    streaming: StreamingOption,
    frequencia: FrequenciaPagamento,
    isFixarVencimento: boolean
): Projection[] {
    return cycles.map((c, idx) => {
        const isLast = idx === cycles.length - 1;
        return {
            ...c,
            tipo: isLast
                ? (c.tipo || (isFixarVencimento ? 'Pro-rata' : 'Primeira Mensalidade'))
                : 'Retroativa',
            periodo: `${formatDate(c.periodoInicio, "dd/MM")} - ${formatDate(c.periodoFim, "dd/MM")}`,
            vencimento: formatDate(c.dataVencimento, "dd/MM/yyyy"),
            streaming: streaming.nome,
            streamingId: streaming.id,
            cor: streaming.cor,
            iconeUrl: streaming.iconeUrl,
            index: isLast ? -1 : idx
        };
    });
}

export function calculateWizardFinancials(
    configurations: Map<number, SelectedStreaming>,
    selectedStreamings: StreamingOption[],
    totalVagas: number,
    dataInicio: string,
    diasVencimento: number[]
): FinancialAnalysisResult {
    const dataInicioObj = parseLocalDate(dataInicio);

    if (isNaN(dataInicioObj.getTime())) {
        return createEmptyAnalysis(configurations.size * totalVagas);
    }

    let revenueMensalPerSlot = new Prisma.Decimal(0);
    let custoMensalPerSlot = new Prisma.Decimal(0);
    let nextCycleTotal = new Prisma.Decimal(0);
    const isPastDate = isBefore(startOfDay(dataInicioObj), startOfDay(new Date()));
    const cobrancasProjetadas: Projection[] = [];

    configurations.forEach((config) => {
        const streaming = selectedStreamings.find(s => s.id === config.streamingId);
        if (!streaming) return;

        const valorMensal = new Prisma.Decimal(config.valor || 0);
        const custoBase = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);

        revenueMensalPerSlot = revenueMensalPerSlot.plus(valorMensal);
        custoMensalPerSlot = custoMensalPerSlot.plus(custoBase);

        // Calculate sequence of cycles for this streaming
        const cycles = getSubscriptionCycles(config, dataInicioObj, diasVencimento, isPastDate);

        // Accumulate next cycle total (always the last one in the calculated sequence)
        const lastCycle = cycles[cycles.length - 1];
        nextCycleTotal = nextCycleTotal.plus(new Prisma.Decimal(lastCycle.valor).mul(totalVagas));

        // Add to global projections
        cobrancasProjetadas.push(...mapToProjections(
            cycles,
            streaming,
            config.frequencia as FrequenciaPagamento,
            diasVencimento.length > 0
        ));
    });

    const receitaMensalTotal = revenueMensalPerSlot.mul(totalVagas);
    const custoMensalTotal = custoMensalPerSlot.mul(totalVagas);
    const lucroLiquidoMensal = receitaMensalTotal.minus(custoMensalTotal);

    const margemLucro = receitaMensalTotal.gt(0)
        ? lucroLiquidoMensal.div(receitaMensalTotal).mul(100).toNumber()
        : 0;

    // Determine the next actual due date (first non-retroactive one)
    const futureCycles = cobrancasProjetadas.filter(p => p.tipo !== 'Retroativa');
    const proximoVencimento = futureCycles.length > 0
        ? futureCycles[0].dataVencimento
        : (cobrancasProjetadas.length > 0 ? cobrancasProjetadas[0].dataVencimento : null);

    // Total of all projected charges for initial launch
    const valorTotalLancamento = cobrancasProjetadas.reduce((acc, c) => acc + (c.valor * totalVagas), 0);

    return {
        receitaMensalTotal: arredondarMoeda(receitaMensalTotal).toNumber(),
        custoMensalTotal: arredondarMoeda(custoMensalTotal).toNumber(),
        lucroLiquidoMensal: arredondarMoeda(lucroLiquidoMensal).toNumber(),
        totalProximaFatura: arredondarMoeda(nextCycleTotal).toNumber(),
        margemLucro: Math.round(margemLucro),
        totalAssinaturas: configurations.size * totalVagas,
        isPastDate,
        proximoVencimento,
        valorTotalLancamento,
        cobrancasProjetadas
    };
}

function createEmptyAnalysis(totalAssinaturas: number): FinancialAnalysisResult {
    return {
        receitaMensalTotal: 0,
        custoMensalTotal: 0,
        lucroLiquidoMensal: 0,
        totalProximaFatura: 0,
        margemLucro: 0,
        totalAssinaturas,
        isPastDate: false,
        proximoVencimento: null,
        valorTotalLancamento: 0,
        cobrancasProjetadas: []
    };
}
