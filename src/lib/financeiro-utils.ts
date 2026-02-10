import { FrequenciaPagamento, Prisma } from "@prisma/client";
import { addMonths, lastDayOfMonth, isAfter, getDate, setDate } from "date-fns";

export const INTERVALOS_MESES: Record<FrequenciaPagamento, number> = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
};

export const FREQUENCIA_MULTIPLICADORES: Record<FrequenciaPagamento, number> = {
    mensal: 1 / INTERVALOS_MESES.mensal,
    trimestral: 1 / INTERVALOS_MESES.trimestral,
    semestral: 1 / INTERVALOS_MESES.semestral,
    anual: 1 / INTERVALOS_MESES.anual,
};

/**
 * Calculates the next due date based on the payment frequency.
 * Uses an anchor date strategy to prevent date drift (e.g., maintaining 31st across months).
 * 
 * @param dataReferencia - The reference date (usually the last due date or start date)
 * @param frequencia - Payment frequency (monthly, quarterly, etc.)
 * @param dataInicioAnchor - The original start date of the subscription (optional but recommended for drift prevention)
 * @returns The next due date
 */
export function calcularProximoVencimento(
    dataReferencia: Date,
    frequencia: FrequenciaPagamento,
    dataInicioAnchor?: Date
): Date {
    const dataBase = addMonths(dataReferencia, INTERVALOS_MESES[frequencia]);

    if (dataInicioAnchor) {
        const diaOriginal = getDate(dataInicioAnchor);
        const ultimoDiaDoMes = getDate(lastDayOfMonth(dataBase));

        // If the original start day (e.g., 31) is valid in the target month (e.g. Mar has 31),
        // but addMonths snapped to Feb 28 and now we are in Mar 28, we snap back to 31.
        if (diaOriginal > getDate(dataBase) && diaOriginal <= ultimoDiaDoMes) {
            return setDate(dataBase, diaOriginal);
        }
    }

    return dataBase;
}

/**
 * Calculates the total charge value for a specific period based on frequency.
 * 
 * @param valorMensal - The monthly value of the subscription
 * @param frequencia - Payment frequency
 * @returns The total value as Prisma.Decimal
 */
export function calcularValorPeriodo(
    valorMensal: Prisma.Decimal | number,
    frequencia: FrequenciaPagamento
): Prisma.Decimal {
    const multiplier = INTERVALOS_MESES[frequencia];
    const valorDecimal = new Prisma.Decimal(valorMensal.toString());
    return valorDecimal.mul(multiplier);
}

/**
 * Checks if a charge is overdue.
 * 
 * @param dataVencimento - The due date
 * @returns true if the current date is past the due date
 */
export function estaAtrasado(dataVencimento: Date): boolean {
    return isAfter(new Date(), dataVencimento);
}
