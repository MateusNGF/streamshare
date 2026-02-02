import "./zod-setup";
import { z } from "zod";
import { FrequenciaPagamento } from "@prisma/client";

// Helper for number coercion that handles empty strings as undefined (triggering required error)
// or invalid numbers as NaN (triggering invalid_type error)
const numericString = (schema: z.ZodNumber) => z.preprocess((val) => {
    if (typeof val === "string") {
        if (val.trim() === "") return undefined;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
    }
    return val;
}, schema);

export const StreamingSchema = z.object({
    catalogoId: z.string()
        .min(1, "Selecione um serviço"),

    apelido: z.string()
        .min(1, "Nome do streaming é obrigatório"),

    valorIntegral: numericString(
        z.number()
            .nonnegative("Valor não pode ser negativo")
    ),

    limiteParticipantes: numericString(
        z.number()
            .int("Limite deve ser um número inteiro")
            .min(1, "Limite deve ser no mínimo 1")
            .max(100, "Limite deve ser no máximo 100")
    ),
});

export type StreamingSchemaType = z.infer<typeof StreamingSchema>;

export const AssinaturaSchema = z.object({
    streamingId: z.number(),

    frequencia: z.enum(FrequenciaPagamento, {
        error: () => ({ message: "Selecione uma frequência válida" })
    }),

    valor: numericString(
        z.number()
            .nonnegative("Valor não pode ser negativo")
    )
});

export type AssinaturaSchemaType = z.infer<typeof AssinaturaSchema>;
