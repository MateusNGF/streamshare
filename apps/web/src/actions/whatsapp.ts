"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

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

// Criptografia simples (em produção, usar lib como crypto-js ou AWS KMS)
function encrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY || "default-encryption-key-change-me";
    const cipher = crypto.createCipher("aes-256-cbc", key);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function decrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY || "default-encryption-key-change-me";
    const decipher = crypto.createDecipher("aes-256-cbc", key);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export async function getWhatsAppConfig() {
    const { contaId } = await getContext();

    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });

    if (!config) return null;

    // Não retornar credenciais completas
    return {
        ...config,
        apiKey: config.apiKey ? "••••••••" : "",
        apiSecret: config.apiSecret ? "••••••••" : "",
    };
}

export async function saveWhatsAppConfig(data: {
    apiKey: string;
    apiSecret?: string;
    phoneNumber?: string;
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

    // Verificar se já existe configuração
    const existingConfig = await prisma.whatsAppConfig.findUnique({
        where: { contaId }
    });

    const isApiKeyMasked = data.apiKey === "••••••••";
    const isApiSecretMasked = data.apiSecret === "••••••••";

    // Validações - só exigir se não existir config ou valor não for mascarado
    if (!data.apiKey || (isApiKeyMasked && !existingConfig)) {
        throw new Error("Account SID é obrigatório");
    }

    if (!data.apiSecret || (isApiSecretMasked && !existingConfig)) {
        throw new Error("Auth Token é obrigatório");
    }

    if (!data.phoneNumber) {
        throw new Error("Número WhatsApp (From) é obrigatório");
    }

    if (data.diasAvisoVencimento < 0 || data.diasAvisoVencimento > 30) {
        throw new Error("Dias de aviso deve estar entre 0 e 30");
    }


    const encryptedData: any = {
        phoneNumber: data.phoneNumber || "",
        notificarNovaAssinatura: data.notificarNovaAssinatura,
        notificarCobrancaGerada: data.notificarCobrancaGerada,
        notificarCobrancaVencendo: data.notificarCobrancaVencendo,
        notificarCobrancaAtrasada: data.notificarCobrancaAtrasada,
        notificarAssinaturaSuspensa: data.notificarAssinaturaSuspensa,
        notificarPagamentoConfirmado: data.notificarPagamentoConfirmado,
        diasAvisoVencimento: data.diasAvisoVencimento,
        isAtivo: data.isAtivo,
    };

    // Only encrypt if not masked
    if (data.apiKey && !isApiKeyMasked) {
        encryptedData.apiKey = encrypt(data.apiKey);
    }
    if (data.apiSecret && !isApiSecretMasked) {
        encryptedData.apiSecret = encrypt(data.apiSecret);
    }

    await prisma.whatsAppConfig.upsert({
        where: { contaId },
        create: {
            contaId,
            ...encryptedData,
            apiKey: encryptedData.apiKey || "",
        },
        update: {
            ...(encryptedData.apiKey && { apiKey: encryptedData.apiKey }),
            ...(encryptedData.apiSecret && { apiSecret: encryptedData.apiSecret }),
            phoneNumber: encryptedData.phoneNumber,
            notificarNovaAssinatura: encryptedData.notificarNovaAssinatura,
            notificarCobrancaGerada: encryptedData.notificarCobrancaGerada,
            notificarCobrancaVencendo: encryptedData.notificarCobrancaVencendo,
            notificarCobrancaAtrasada: encryptedData.notificarCobrancaAtrasada,
            notificarAssinaturaSuspensa: encryptedData.notificarAssinaturaSuspensa,
            notificarPagamentoConfirmado: encryptedData.notificarPagamentoConfirmado,
            diasAvisoVencimento: encryptedData.diasAvisoVencimento,
            isAtivo: encryptedData.isAtivo,
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
