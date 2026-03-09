import { FrequenciaPagamento } from "@prisma/client";
import { isBefore, startOfDay, addMonths, setDate, getDate, lastDayOfMonth } from "date-fns";
import { INTERVALOS_MESES, calcularValorPeriodo, calcularValorProRata, escolherProximoDiaVencimento, calcularDataVencimentoPadrao, parseLocalDate } from "./financeiro-utils";
import { Prisma } from "@prisma/client";

export interface RetroactiveCycle {
    periodoInicio: Date;
    periodoFim: Date;
    dataVencimento: Date;
    valor: Prisma.Decimal;
    label: string;
}

/**
 * Advances `currentDate` by one billing cycle based on frequency, anchoring to the original
 * start day to prevent date drift (e.g. Jan 31 → Feb 28 → Mar 31).
 */
function avancarCiclo(currentDate: Date, frequencia: FrequenciaPagamento, diaAncora: number): Date {
    const nextMonth = addMonths(currentDate, INTERVALOS_MESES[frequencia]);
    const ultimoDiaDoMes = getDate(lastDayOfMonth(nextMonth));
    const diaAlvo = Math.min(diaAncora, ultimoDiaDoMes);
    return setDate(nextMonth, diaAlvo);
}

/**
 * Calculates all retroactive billing cycles from a past start date up to the current cycle.
 *
 * Strategy:
 * - If `diasVencimento` are configured, the FIRST cycle is pro-rata (from dataInicio to the
 *   next configured due date). Subsequent cycles are full months aligned to the due-date anchor.
 * - If no `diasVencimento`, all cycles are full-frequency periods starting from dataInicio.
 */
export function gerarCiclosRetroativos(params: {
    dataInicio: Date;
    frequencia: FrequenciaPagamento;
    valorMensal: number | Prisma.Decimal;
    diasVencimento?: number[];
}): RetroactiveCycle[] {
    const { dataInicio, frequencia, valorMensal, diasVencimento } = params;
    const hoje = startOfDay(new Date());
    const dataInicioAnchor = parseLocalDate(dataInicio);

    if (!isBefore(dataInicioAnchor, hoje)) {
        return [];
    }

    const ciclos: RetroactiveCycle[] = [];
    const isFixarVencimento = diasVencimento && diasVencimento.length > 0;
    const diaAncora = getDate(dataInicioAnchor); // Used to prevent date drift in full cycles

    if (isFixarVencimento) {
        // === STRATEGY: Fixed due-dates ===
        // 1st cycle: Pro-rata from dataInicio to the first configured due date.
        const primeiroVencimento = escolherProximoDiaVencimento(diasVencimento!, dataInicioAnchor);
        const valorProRata = calcularValorProRata(valorMensal, dataInicioAnchor, primeiroVencimento);

        // Only add the pro-rata cycle if its period start is before today
        if (isBefore(dataInicioAnchor, hoje)) {
            ciclos.push({
                periodoInicio: dataInicioAnchor,
                periodoFim: primeiroVencimento,
                dataVencimento: primeiroVencimento,
                valor: valorProRata,
                label: `${dataInicioAnchor.toLocaleDateString('pt-BR')} – ${primeiroVencimento.toLocaleDateString('pt-BR')} (Pro-rata)`,
            });
        }

        // Subsequent full cycles: each starts at the previous due-date and lasts one frequency-period.
        let currentPeriodInicio = primeiroVencimento;
        const diaVencimentoAncora = getDate(primeiroVencimento); // keep this consistent

        while (isBefore(currentPeriodInicio, hoje)) {
            // Period end = next due date (one billing cycle forward)
            const nextMonth = addMonths(currentPeriodInicio, INTERVALOS_MESES[frequencia]);
            const ultimoDiaDoMes = getDate(lastDayOfMonth(nextMonth));
            const diaAlvo = Math.min(diaVencimentoAncora, ultimoDiaDoMes);
            const periodoFim = setDate(nextMonth, diaAlvo);

            const dataVencimento = periodoFim; // Due on the same day the period ends
            const valor = calcularValorPeriodo(valorMensal, frequencia);

            ciclos.push({
                periodoInicio: currentPeriodInicio,
                periodoFim,
                dataVencimento,
                valor,
                label: `${currentPeriodInicio.toLocaleDateString('pt-BR')} – ${periodoFim.toLocaleDateString('pt-BR')}`,
            });

            currentPeriodInicio = periodoFim;
        }
    } else {
        // === STRATEGY: No fixed due-dates (standard) ===
        // All cycles are full frequency-periods starting from dataInicio.
        let currentPeriodInicio = dataInicioAnchor;

        while (isBefore(currentPeriodInicio, hoje)) {
            const periodoFim = avancarCiclo(currentPeriodInicio, frequencia, diaAncora);
            const dataVencimento = calcularDataVencimentoPadrao(currentPeriodInicio);
            const valor = calcularValorPeriodo(valorMensal, frequencia);

            ciclos.push({
                periodoInicio: currentPeriodInicio,
                periodoFim,
                dataVencimento,
                valor,
                label: `${currentPeriodInicio.toLocaleDateString('pt-BR')} – ${periodoFim.toLocaleDateString('pt-BR')}`,
            });

            currentPeriodInicio = periodoFim;
        }
    }

    return ciclos;
}
