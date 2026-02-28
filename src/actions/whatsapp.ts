"use server";

import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";

import { getContext } from "@/lib/action-context";
import { PLANS } from "@/config/plans";

export async function getWhatsAppConfig() {
    try {
        const { contaId } = await getContext();

        const config = await prisma.whatsAppConfig.findUnique({
            where: { contaId },
        });

        return { success: true, data: config };
    } catch (error: any) {
        console.error("[GET_WHATSAPP_CONFIG_ERROR]", error);
        return { success: false, error: "Erro ao buscar configuração do WhatsApp" };
    }
}

export async function saveWhatsAppConfig(data: {
    notificarNovaAssinatura: boolean;
    notificarCobrancaGerada: boolean;
    notificarCobrancaVencendo: boolean;
    notificarCobrancaAtrasada: boolean;
    notificarAssinaturaSuspensa: boolean;
    notificarPagamentoConfirmado: boolean;
    diasAvisoVencimento: number;
    isAtivo: boolean;
}) {
    try {
        const { contaId } = await getContext();

        // Validações
        if (data.diasAvisoVencimento < 0 || data.diasAvisoVencimento > 30) {
            return { success: false, error: "Dias de aviso deve estar entre 0 e 30" };
        }

        // Validate if plan supports automation
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        if (data.isAtivo && !PLANS[conta.plano].automationEnabled) {
            return { success: false, error: "Seu plano não permite automação (WhatsApp/Telegram). Faça upgrade para o plano Business." };
        }

        const result = await prisma.whatsAppConfig.upsert({
            where: { contaId },
            create: {
                contaId,
                notificarNovaAssinatura: data.notificarNovaAssinatura,
                notificarCobrancaGerada: data.notificarCobrancaGerada,
                notificarCobrancaVencendo: data.notificarCobrancaVencendo,
                notificarCobrancaAtrasada: data.notificarCobrancaAtrasada,
                notificarAssinaturaSuspensa: data.notificarAssinaturaSuspensa,
                notificarPagamentoConfirmado: data.notificarPagamentoConfirmado,
                diasAvisoVencimento: data.diasAvisoVencimento,
                isAtivo: data.isAtivo,
            },
            update: {
                notificarNovaAssinatura: data.notificarNovaAssinatura,
                notificarCobrancaGerada: data.notificarCobrancaGerada,
                notificarCobrancaVencendo: data.notificarCobrancaVencendo,
                notificarCobrancaAtrasada: data.notificarCobrancaAtrasada,
                notificarAssinaturaSuspensa: data.notificarAssinaturaSuspensa,
                notificarPagamentoConfirmado: data.notificarPagamentoConfirmado,
                diasAvisoVencimento: data.diasAvisoVencimento,
                isAtivo: data.isAtivo,
            },
        });

        revalidatePath("/configuracoes");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[SAVE_WHATSAPP_CONFIG_ERROR]", error);
        return { success: false, error: error.message || "Erro ao salvar configuração do WhatsApp" };
    }
}

export async function testWhatsAppConnection(testNumber: string) {
    try {
        const { contaId } = await getContext();

        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!conta || !PLANS[conta.plano].automationEnabled) {
            return { success: false, error: "Funcionalidade indisponível no seu plano.", code: "FORBIDDEN" };
        }

        const config = await prisma.whatsAppConfig.findUnique({
            where: { contaId },
        });

        if (!config) {
            return { success: false, error: "Configure o WhatsApp primeiro", code: "NOT_FOUND" };
        }

        // Envio real através da API
        const { sendWhatsAppDirect } = await import("@/lib/whatsapp-meta");
        const result = await sendWhatsAppDirect(testNumber, "Mensagem de teste do StreamShare");

        if (!result.success) {
            return {
                success: false,
                error: result.error || "Erro ao enviar mensagem de teste.",
                code: "SEND_ERROR"
            };
        }

        return {
            success: true,
            data: { message: "Teste enviado com sucesso!", messageId: result.messageId }
        };
    } catch (error: any) {
        console.error("[TEST_WHATSAPP_CONNECTION_ERROR]", error);
        return { success: false, error: error.message || "Erro ao testar conexão do WhatsApp" };
    }
}

export async function getWhatsAppLogs(limit: number = 50) {
    try {
        const { contaId } = await getContext();

        const config = await prisma.whatsAppConfig.findUnique({
            where: { contaId },
            select: { id: true },
        });

        if (!config) return { success: true, data: [] };

        const logs = await prisma.whatsAppLog.findMany({
            where: { configId: config.id },
            include: {
                participante: {
                    select: { nome: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return { success: true, data: logs };
    } catch (error: any) {
        console.error("[GET_WHATSAPP_LOGS_ERROR]", error);
        return { success: false, error: "Erro ao buscar logs do WhatsApp" };
    }
}
