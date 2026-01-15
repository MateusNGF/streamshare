import { FrequenciaPagamento, Prisma } from "@streamshare/database";

const INTERVALOS_MESES: Record<FrequenciaPagamento, number> = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
};

/**
 * Calculate next due date based on frequency
 */
export function calcularProximoVencimento(
    dataReferencia: Date,
    frequencia: FrequenciaPagamento
): Date {
    const novaData = new Date(dataReferencia);
    novaData.setMonth(novaData.getMonth() + INTERVALOS_MESES[frequencia]);
    return novaData;
}

/**
 * Calculate total charge value for a period based on frequency
 */
export function calcularValorPeriodo(
    valorMensal: Prisma.Decimal,
    frequencia: FrequenciaPagamento
): Prisma.Decimal {
    const multiplier = INTERVALOS_MESES[frequencia];
    return new Prisma.Decimal(valorMensal.toString()).mul(multiplier);
}

/**
 * Check if a charge is overdue
 */
export function estaAtrasado(dataVencimento: Date): boolean {
    return new Date() > dataVencimento;
}

/**
 * Format currency to BRL
 */
export function formatarMoeda(valor: number | Prisma.Decimal): string {
    const numberValue = typeof valor === 'number' ? valor : Number(valor.toString());
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numberValue);
}
