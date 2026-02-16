"use server";

import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";

import { getContext } from "@/lib/action-context";
import { PLANS } from "@/config/plans";

export async function getWhatsAppConfig() {
    const { contaId } = await getContext();

    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });

    return config;
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
    const { contaId } = await getContext();

    // Validações
    if (data.diasAvisoVencimento < 0 || data.diasAvisoVencimento > 30) {
        throw new Error("Dias de aviso deve estar entre 0 e 30");
    }

    // Validate if plan supports automation
    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { plano: true }
    });

    if (!conta) throw new Error("Conta não encontrada");

    if (data.isAtivo && !PLANS[conta.plano].automationEnabled) {
        // Allow saving config but force isAtivo to false if plan doesn't support it?
        // Or throw error? User said "Business... automation".
        // Ideally throw error if they try to ENABLE it.
        throw new Error("Seu plano não permite automação (WhatsApp/Telegram). Faça upgrade para o plano Business.");
    }

    await prisma.whatsAppConfig.upsert({
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
}

export async function testWhatsAppConnection(testNumber: string) {
    const { contaId } = await getContext();

    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { plano: true }
    });

    if (!conta || !PLANS[conta.plano].automationEnabled) {
        throw new Error("Funcionalidade indisponível no seu plano.");
    }

    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });

    if (!config) {
        throw new Error("Configure o WhatsApp primeiro");
    }

    // Simulate sending test message
    // In production, this would use the actual WhatsApp service
    return {
        success: true,
        message: "Teste enviado com sucesso (mock)",
    };
}

export async function getWhatsAppLogs(limit: number = 50) {
    const { contaId } = await getContext();

    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
        select: { id: true },
    });

    if (!config) return [];

    return prisma.whatsAppLog.findMany({
        where: { configId: config.id },
        include: {
            participante: {
                select: { nome: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
