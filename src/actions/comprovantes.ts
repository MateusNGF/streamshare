"use server";

import { revalidatePath } from "next/cache";
import { CobrancasService } from "@/services/cobrancas.service";
import { getContext } from "@/lib/action-context";

/**
 * Envia o comprovativo de pagamento para uma cobrança específica.
 * Usado pelo participante.
 */
export async function enviarComprovanteAction(cobrancaId: number, formData: FormData) {
    try {
        const ctx = await getContext();
        const file = formData.get("comprovante") as File;

        if (!file || !(file instanceof Blob)) {
            return {
                sucesso: false,
                erro: "Comprovante não enviado ou formato inválido."
            };
        }

        const result = await CobrancasService.enviarComprovativo(cobrancaId, file as File, {
            userId: ctx.userId,
            contaId: ctx.contaId
        });

        if (!result.sucesso) {
            return result;
        }

        revalidatePath("/(dashboard)/faturas");

        return { sucesso: true };
    } catch (error: any) {
        console.error("Erro ao enviar comprovante:", error);
        return {
            sucesso: false,
            erro: error.message || "Erro interno ao enviar comprovante."
        };
    }
}

/**
 * Aprova uma cobrança após a validação do comprovativo.
 * Usado pelo administrador.
 */
export async function aprovarComprovanteAction(cobrancaId: number) {
    try {
        const ctx = await getContext();
        const result = await CobrancasService.aprovarComprovativo(cobrancaId, {
            contaId: ctx.contaId
        });

        if (!result.sucesso) return result;

        revalidatePath("/(dashboard)/faturas");
        revalidatePath("/(dashboard)/provedor/cobrancas");

        return { sucesso: true };
    } catch (error: any) {
        console.error("Erro ao aprovar comprovante:", error);
        return {
            sucesso: false,
            erro: error.message || "Erro interno ao aprovar comprovante."
        };
    }
}

/**
 * Rejeita um comprovativo, permitindo que o participante envie um novo.
 * Usado pelo administrador.
 */
export async function rejeitarComprovanteAction(cobrancaId: number) {
    try {
        const ctx = await getContext();
        const result = await CobrancasService.rejeitarComprovativo(cobrancaId, {
            contaId: ctx.contaId
        });

        if (!result.sucesso) return result;

        revalidatePath("/(dashboard)/faturas");
        revalidatePath("/(dashboard)/provedor/cobrancas");

        return { sucesso: true };
    } catch (error: any) {
        console.error("Erro ao rejeitar comprovante:", error);
        return {
            sucesso: false,
            erro: error.message || "Erro interno ao rejeitar comprovante."
        };
    }
}
