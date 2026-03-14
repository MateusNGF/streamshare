
/**
 * Interface para representar um intervalo numérico (mínimo e máximo).
 */
export interface NumberRange {
    min?: number | string;
    max?: number | string;
}

/**
 * Interface para representar um intervalo de datas (início e fim).
 */
export interface DateRange {
    from?: string | Date;
    to?: string | Date;
}

/**
 * Helper para validar se um valor está dentro de um intervalo de datas.
 * Previne erros de parsing repetitivos e lida com valores nulos.
 */
export function isWithinDateRange(value: Date | string | null | undefined, rangeStr: string | null | undefined): boolean {
    if (!rangeStr) return true;
    if (!value) return false;

    try {
        const range: DateRange = JSON.parse(rangeStr);
        const dateValue = value instanceof Date ? value : new Date(value);

        if (range.from && dateValue < new Date(range.from)) return false;
        if (range.to && dateValue > new Date(range.to)) return false;

        return true;
    } catch (e) {
        return true; // Se o JSON for inválido, não filtra (Open door policy)
    }
}

/**
 * Helper para validar se um valor está dentro de um intervalo numérico.
 */
export function isWithinNumberRange(value: number | string | null | undefined, rangeStr: string | null | undefined): boolean {
    if (!rangeStr) return true;
    if (value === undefined || value === null) return false;

    try {
        const range: NumberRange = JSON.parse(rangeStr);
        const numValue = Number(value);

        if (range.min !== undefined && range.min !== "" && numValue < Number(range.min)) return false;
        if (range.max !== undefined && range.max !== "" && numValue > Number(range.max)) return false;

        return true;
    } catch (e) {
        return true;
    }
}

/**
 * Helper para validar correspondência de mês de referência (YYYY-MM).
 */
export function matchesMonthReference(date: Date | string, mesReferencia: string): boolean {
    if (mesReferencia === "all") return true;

    const d = date instanceof Date ? date : new Date(date);
    const cobrancaMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return cobrancaMes === mesReferencia;
}
