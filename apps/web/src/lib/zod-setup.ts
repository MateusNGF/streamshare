import { z } from "zod";

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
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
    }

    if (issue.code === z.ZodIssueCode.too_big) {
        if (issue.type === "number") {
            return { message: `Deve ser menor ou igual a ${issue.maximum}` };
        }
    }

    return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

export { z };
