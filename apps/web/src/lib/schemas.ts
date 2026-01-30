import { z } from "zod";
import { FrequenciaPagamento } from "@streamshare/database";

export const StreamingSchema = z.object({
    catalogoId: z.string().min(1, "Selecione um serviço"),
    apelido: z.string().min(1, "Nome do streaming é obrigatório"),
    valorIntegral: z.preprocess(
        (val: unknown) => (typeof val === "string" ? parseFloat(val) : val),
        z.number({ invalid_type_error: "Valor inválido" }).positive("Valor deve ser maior que zero")
    ),
    limiteParticipantes: z.preprocess(
        (val: unknown) => (typeof val === "string" ? parseInt(val, 10) : val),
        z.number({ invalid_type_error: "Limite inválido" })
            .int("Limite deve ser um número inteiro")
            .min(1, "Limite deve ser no mínimo 1")
            .max(100, "Limite deve ser no máximo 100")
    ),
});

export type StreamingSchemaType = z.infer<typeof StreamingSchema>;

export const AssinaturaSchema = z.object({
    streamingId: z.number(),
    frequencia: z.nativeEnum(FrequenciaPagamento),
    valor: z.preprocess(
        (val: unknown) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().nonnegative("Valor não pode ser negativo")
    )
});

export type AssinaturaSchemaType = z.infer<typeof AssinaturaSchema>;
