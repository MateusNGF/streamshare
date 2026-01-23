"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId };
}

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
