import { parse, isValid, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Safely formats a "YYYY-MM" string or Date object into a readable month/year string.
 * Uses date-fns for reliable parsing and formatting.
 */
export function formatMesReferencia(mesReferencia?: string | Date | null): string {
    if (!mesReferencia) return "Mês Ref.";

    const date = typeof mesReferencia === "string"
        ? (mesReferencia.length <= 7 ? parse(mesReferencia, "yyyy-MM", new Date()) : parseISO(mesReferencia))
        : mesReferencia;

    return isValid(date)
        ? format(date, "MMM/yy", { locale: ptBR })
        : "Inválido";
}
