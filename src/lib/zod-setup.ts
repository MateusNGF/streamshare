import { z } from "zod";

const customErrorMap: z.ZodErrorMap = (issue) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
        if (issue.expected === "number") {
            return { message: "Deve ser um número" };
        }
        if (issue.received === "undefined" || issue.received === "null") {
            return { message: "Campo obrigatório" };
        }
        return { message: "Tipo inválido" };
    }

    if (issue.code === z.ZodIssueCode.too_small) {
        if (issue.type === "string") {
            return { message: `Deve ter no mínimo ${issue.minimum} caractere(s)` };
        }
        if (issue.type === "number") {
            return { message: `Deve ser maior ou igual a ${issue.minimum}` };
        }
        if (issue.type === "array") {
            return { message: `Deve ter no mínimo ${issue.minimum} item(s)` };
        }
    }

    if (issue.code === z.ZodIssueCode.too_big) {
        if (issue.type === "string") {
            return { message: `Deve ter no máximo ${issue.maximum} caractere(s)` };
        }
        if (issue.type === "number") {
            return { message: `Deve ser menor ou igual a ${issue.maximum}` };
        }
        if (issue.type === "array") {
            return { message: `Deve ter no máximo ${issue.maximum} item(s)` };
        }
    }

    if (issue.code === z.ZodIssueCode.invalid_format) {
        if (issue.validation === "email") {
            return { message: "E-mail inválido" };
        }
        if (issue.validation === "url") {
            return { message: "URL inválida" };
        }
        if (issue.validation === "uuid") {
            return { message: "ID inválido (UUID)" };
        }
    }

    if (issue.code === z.ZodIssueCode.invalid_value) {
        if (issue.values) {
            return { message: `Valor inválido. Esperado: ${issue.values.join(" | ")}` };
        }
    }

    return { message: issue.message ?? "Campo inválido" };
};

z.setErrorMap(customErrorMap);

export { z };
