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

interface Projection {
    tipo: string;
    periodo: string;
    vencimento: string;
    valor: number;
    streaming: string;
}

interface FinancialAnalysisResult {
    receitaMensalTotal: number;
    custoMensalTotal: number;
    lucroLiquidoMensal: number;
    totalProximaFatura: number;
    margemLucro: number;
    totalAssinaturas: number;
    isPastDate: boolean;
    cobrancasProjetadas: Projection[];
}

export function calculateWizardFinancials(
    configurations: Map<number, SelectedStreaming>,
    selectedStreamings: StreamingOption[],
    totalVagas: number,
    dataInicio: string,
    diasVencimento: number[]
): FinancialAnalysisResult {
    let revenueMensalPerSlot = new Prisma.Decimal(0);
    let custoMensalPerSlot = new Prisma.Decimal(0);
    let nextCycleTotal = new Prisma.Decimal(0);
    const dataInicioObj = parseLocalDate(dataInicio);
    const isPastDate = isBefore(startOfDay(dataInicioObj), startOfDay(new Date()));

    configurations.forEach((config) => {
        const streaming = selectedStreamings.find(s => s.id === config.streamingId);
        if (!streaming) return;

        const valorCobrado = new Prisma.Decimal(config.valor || 0);
        const custoBase = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);

        revenueMensalPerSlot = revenueMensalPerSlot.plus(valorCobrado);
        custoMensalPerSlot = custoMensalPerSlot.plus(custoBase);

        const isFixarVencimento = diasVencimento.length > 0;
        const dataVencObj = isFixarVencimento
            ? escolherProximoDiaVencimento(diasVencimento, dataInicioObj)
            : calcularDataVencimentoPadrao(dataInicioObj);

        let cycleTotalPerSeat = new Prisma.Decimal(0);
        if (isFixarVencimento) {
            cycleTotalPerSeat = calcularValorProRata(valorCobrado, dataInicioObj, dataVencObj);
        } else {
            cycleTotalPerSeat = calcularTotalCiclo(valorCobrado, config.frequencia as FrequenciaPagamento);
        }

        nextCycleTotal = nextCycleTotal.plus(cycleTotalPerSeat.mul(totalVagas));
    });

    const receitaMensalTotal = revenueMensalPerSlot.mul(totalVagas);
    const custoMensalTotal = custoMensalPerSlot.mul(totalVagas);
    const lucroLiquidoMensal = receitaMensalTotal.minus(custoMensalTotal);

    const margemLucro = receitaMensalTotal.gt(0)
        ? lucroLiquidoMensal.div(receitaMensalTotal).mul(100).toNumber()
        : 0;

    const cobrancasProjetadas: Projection[] = [];

    configurations.forEach(config => {
        const streaming = selectedStreamings.find(s => s.id === config.streamingId);
        if (!streaming) return;

        const valorCobrado = new Prisma.Decimal(config.valor || 0);
        const isFixarVencimento = diasVencimento.length > 0;

        // 1. Retroactive cycles
        if (isPastDate) {
            const ciclosRetro = gerarCiclosRetroativos({
                dataInicio: dataInicioObj,
                frequencia: config.frequencia as FrequenciaPagamento,
                valorMensal: valorCobrado,
                diasVencimento
            });
            cobrancasProjetadas.push(...ciclosRetro.map((c: any) => ({
                tipo: 'Retroativa',
                periodo: `${formatDate(c.periodoInicio, "dd/MM")} - ${formatDate(c.periodoFim, "dd/MM")}`,
                vencimento: formatDate(c.dataVencimento, "dd/MM/yyyy"),
                valor: c.valor,
                streaming: streaming.nome
            })));
        }

        // 2. Next/Current cycle
        const dataVencObj = isFixarVencimento
            ? escolherProximoDiaVencimento(diasVencimento, dataInicioObj)
            : calcularDataVencimentoPadrao(dataInicioObj);

        let val;
        if (isFixarVencimento) {
            val = calcularValorProRata(valorCobrado, dataInicioObj, dataVencObj);
        } else {
            val = calcularTotalCiclo(valorCobrado, config.frequencia as FrequenciaPagamento);
        }

        cobrancasProjetadas.push({
            tipo: isFixarVencimento ? 'Pro-rata' : 'Primeira Mensalidade',
            periodo: `${formatDate(dataInicioObj, "dd/MM")} - ${formatDate(dataVencObj, "dd/MM")}`,
            vencimento: formatDate(dataVencObj, "dd/MM/yyyy"),
            valor: val.toNumber(),
            streaming: streaming.nome
        });
    });

    return {
        receitaMensalTotal: arredondarMoeda(receitaMensalTotal).toNumber(),
        custoMensalTotal: arredondarMoeda(custoMensalTotal).toNumber(),
        lucroLiquidoMensal: arredondarMoeda(lucroLiquidoMensal).toNumber(),
        totalProximaFatura: arredondarMoeda(nextCycleTotal).toNumber(),
        margemLucro: Math.round(margemLucro),
        totalAssinaturas: configurations.size * totalVagas,
        isPastDate,
        cobrancasProjetadas
    };
}
