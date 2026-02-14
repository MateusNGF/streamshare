"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SENSITIVE_KEYWORDS = ["token", "secret", "password", "key", "sid", "auth"];

function maskSensitiveValue(key: string, value: string): string {
    const isSensitive = SENSITIVE_KEYWORDS.some(keyword => key.toLowerCase().includes(keyword));
    if (isSensitive && value) {
        return "********";
    }
    return value;
}

interface ParametroInput {
    chave: string;
    valor: string;
    tipo?: string;
    descricao?: string;
}

interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    useTls: boolean;
}

interface WhatsAppTestConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

async function validateAdmin() {
    const session = await getCurrentUser();
    if (!session) {
        throw new Error("Não autenticado");
    }

    const adminUser = await prisma.usuarioAdmin.findFirst({
        where: {
            usuarioId: session.userId,
            isAtivo: true,
        },
    });

    if (!adminUser) {
        throw new Error("Sem permissão para acessar parâmetros do sistema");
    }
}

export async function getParametros() {
    await validateAdmin();

    const parametros = await prisma.parametro.findMany({
        where: { isAtivo: true },
        orderBy: { chave: "asc" },
    });

    return parametros.map(p => ({
        ...p,
        valor: maskSensitiveValue(p.chave, p.valor)
    }));
}

export async function getParametro(chave: string) {
    await validateAdmin();

    const parametro = await prisma.parametro.findUnique({
        where: {
            chave,
        },
    });

    if (!parametro) return null;

    return {
        ...parametro,
        valor: maskSensitiveValue(parametro.chave, parametro.valor)
    };
}

export async function upsertParametro(data: ParametroInput) {
    await validateAdmin();

    const updateData: any = {
        tipo: data.tipo,
        descricao: data.descricao,
    };

    if (data.valor !== "********") {
        updateData.valor = data.valor;
    }

    const parametro = await prisma.parametro.upsert({
        where: {
            chave: data.chave,
        },
        create: {
            chave: data.chave,
            valor: data.valor === "********" ? "" : data.valor,
            tipo: data.tipo || "string",
            descricao: data.descricao,
        },
        update: updateData,
    });

    revalidatePath("/admin/parametros");
    return parametro;
}

export async function upsertParametros(parametros: ParametroInput[]) {
    await validateAdmin();

    const results = await Promise.all(
        parametros.map((data) => {
            const updateData: any = {
                tipo: data.tipo,
                descricao: data.descricao,
            };

            if (data.valor !== "********") {
                updateData.valor = data.valor;
            }

            return prisma.parametro.upsert({
                where: {
                    chave: data.chave,
                },
                create: {
                    chave: data.chave,
                    valor: data.valor === "********" ? "" : data.valor,
                    tipo: data.tipo || "string",
                    descricao: data.descricao,
                },
                update: updateData,
            });
        })
    );

    revalidatePath("/admin/parametros");
    return results;
}

export async function deleteParametro(chave: string) {
    await validateAdmin();

    await prisma.parametro.delete({
        where: {
            chave,
        },
    });

    revalidatePath("/admin/parametros");
}

export async function testSmtpConnection(config: SmtpConfig) {
    try {
        // Note: This is a placeholder. In production, you would use nodemailer or similar
        // to actually test the SMTP connection
        const nodemailer = await import("nodemailer");

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.useTls,
            auth: {
                user: config.user,
                pass: config.password,
            },
        });

        await transporter.verify();

        return { success: true, message: "Conexão SMTP estabelecida com sucesso!" };
    } catch (error) {
        console.error("SMTP Test Error:", error);
        return {
            success: false,
            message: "Falha na conexão SMTP. Verifique as configurações e tente novamente."
        };
    }
}

export async function testWhatsAppConnection(config: WhatsAppTestConfig) {
    try {
        // Note: This is a placeholder. In production, you would use Twilio SDK
        // to actually test the WhatsApp connection
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}.json`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${config.accountSid}:${config.authToken}`
                    ).toString("base64")}`,
                },
            }
        );

        if (response.ok) {
            return { success: true, message: "Conexão WhatsApp/Twilio estabelecida com sucesso!" };
        } else {
            return { success: false, message: "Credenciais inválidas" };
        }
    } catch (error) {
        console.error("WhatsApp Test Error:", error);
        return {
            success: false,
            message: "Falha na conexão WhatsApp. Verifique as credenciais e tente novamente."
        };
    }
}
