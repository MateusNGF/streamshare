import { FrequenciaPagamento, Prisma } from "@prisma/client";
import { addMonths, lastDayOfMonth, isAfter, getDate, setDate, addDays } from "date-fns";

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

export const PRAZO_VENCIMENTO_PADRAO_DIAS = 5;

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
 * @param valorMensal - The monthly base value of the subscription (e.g., 9.00)
 * @param frequencia - Payment frequency (e.g., trimestral)
 * @returns The total value for the period (e.g., 27.00) as Prisma.Decimal
 */
export function calcularValorPeriodo(
    valorMensal: Prisma.Decimal | number,
    frequencia: FrequenciaPagamento
): Prisma.Decimal {
    const multiplier = INTERVALOS_MESES[frequencia];
    const valorDecimal = new Prisma.Decimal(valorMensal.toString());

    // Round to 2 decimal places to ensure financial consistency
    return valorDecimal.mul(multiplier).toDecimalPlaces(2);
}

/**
 * Checks if a charge is overdue.
 * 
 * @param dataVencimento - The due date (usually the start of the period for prepaid)
 * @returns true if the current date is strictly past the due date
 */
export function estaAtrasado(dataVencimento: Date): boolean {
    return isAfter(new Date(), dataVencimento);
}

/**
 * Rounds a value to exactly 2 decimal places using Prisma.Decimal.
 * Essential for monetary consistency between UI and Backend.
 */
export function arredondarMoeda(valor: Prisma.Decimal | number | string): Prisma.Decimal {
    return new Prisma.Decimal(valor.toString()).toDecimalPlaces(2);
}

/**
 * Calculates the base cost per participant for a streaming service.
 */
export function calcularCustoBase(valorIntegral: Prisma.Decimal | number | string, limiteParticipantes: number): Prisma.Decimal {
    if (limiteParticipantes <= 0) return new Prisma.Decimal(0);
    const valStr = valorIntegral?.toString() || "0";
    const total = new Prisma.Decimal(valStr === "" ? "0" : valStr);
    return arredondarMoeda(total.div(limiteParticipantes));
}

/**
 * Calculates the monthly profit based on current value and base cost.
 */
export function calcularLucroMensal(valorAtual: Prisma.Decimal | number | string, custoBase: Prisma.Decimal | number | string): Prisma.Decimal {
    const atualStr = valorAtual?.toString() || "0";
    const custoStr = custoBase?.toString() || "0";
    const atual = new Prisma.Decimal(atualStr === "" ? "0" : atualStr);
    const custo = new Prisma.Decimal(custoStr === "" ? "0" : custoStr);
    return arredondarMoeda(atual.minus(custo));
}

/**
 * Calculates the total value for a billing cycle (multiple months).
 */
export function calcularTotalCiclo(valorMensal: Prisma.Decimal | number | string, frequencia: FrequenciaPagamento): Prisma.Decimal {
    const valStr = valorMensal?.toString() || "0";
    const valor = new Prisma.Decimal(valStr === "" ? "0" : valStr);
    const multiplier = INTERVALOS_MESES[frequencia];
    return arredondarMoeda(valor.mul(multiplier));
}
/**
 * Calculates the standard due date for a new charge (5 days after emission).
 * 
 * @param dataEmissao - The charge creation date (defaults to now)
 * @returns The standard due date
 */
export function calcularDataVencimentoPadrao(dataEmissao: Date = new Date()): Date {
    return addDays(dataEmissao, PRAZO_VENCIMENTO_PADRAO_DIAS);
}
/**
 * Formata um valor numérico para moeda.
 * 
 * @param valor - Valor a ser formatado
 * @param moeda - Código da moeda (ISO 4217)
 * @returns String formatada (ex: R$ 1.234,56)
 */
export function formatarMoeda(valor: number | string | Prisma.Decimal | any, moeda: string = 'BRL'): string {
    const amount = typeof valor === "number"
        ? valor
        : typeof valor?.toNumber === "function"
            ? valor.toNumber()
            : parseFloat(valor?.toString() || "0");

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: moeda,
    }).format(isNaN(amount) ? 0 : amount);
}
