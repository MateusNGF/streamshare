import { parse, isValid, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Safely formats a "YYYY-MM" string or Date object into a readable month/year string.
 * Uses date-fns for reliable parsing and formatting.
 * 
 * @param mesReferencia "YYYY-MM" string, ISO string, Date object, or undefined/null
 * @returns formatted string (e.g., "jan/25") or a fallback if invalid
 */
export function formatMesReferencia(mesReferencia?: string | Date | null): string {
    if (!mesReferencia) return "Mês Ref.";

    let dateObj: Date;

    if (typeof mesReferencia === "string") {
        if (mesReferencia.includes("-") && mesReferencia.length <= 7) {
            // Usually "YYYY-MM" format
            dateObj = parse(mesReferencia, "yyyy-MM", new Date());
        } else {
            // Fallback for full ISO strings
            dateObj = new Date(mesReferencia);
        }
    } else {
        dateObj = mesReferencia;
    }

    if (!isValid(dateObj)) {
        return "Inválido";
    }

    return format(dateObj, "MMM/yy", { locale: ptBR });
}
