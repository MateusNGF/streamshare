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
        return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };
    }

    const adminUser = await prisma.usuarioAdmin.findFirst({
        where: {
            usuarioId: session.userId,
            isAtivo: true,
        },
    });

    if (!adminUser) {
        return { success: false, error: "Sem permissão para acessar parâmetros do sistema", code: "FORBIDDEN" };
    }

    return { success: true };
}

export async function getParametros() {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        const parametros = await prisma.parametro.findMany({
            where: { isAtivo: true },
            orderBy: { chave: "asc" },
        });

        const data = parametros.map(p => ({
            ...p,
            valor: maskSensitiveValue(p.chave, p.valor)
        }));

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PARAMETROS_ERROR]", error);
        return { success: false, error: "Erro ao buscar parâmetros" };
    }
}

export async function getParametro(chave: string) {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        const parametro = await prisma.parametro.findUnique({
            where: {
                chave,
            },
        });

        if (!parametro) return { success: true, data: null };

        const data = {
            ...parametro,
            valor: maskSensitiveValue(parametro.chave, parametro.valor)
        };

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PARAMETRO_ERROR]", error);
        return { success: false, error: "Erro ao buscar parâmetro" };
    }
}

export async function upsertParametro(data: ParametroInput) {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

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
        return { success: true, data: parametro };
    } catch (error: any) {
        console.error("[UPSERT_PARAMETRO_ERROR]", error);
        return { success: false, error: "Erro ao salvar parâmetro" };
    }
}

export async function upsertParametros(parametros: ParametroInput[]) {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

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
        return { success: true, data: results };
    } catch (error: any) {
        console.error("[UPSERT_PARAMETROS_ERROR]", error);
        return { success: false, error: "Erro ao salvar parâmetros" };
    }
}

export async function deleteParametro(chave: string) {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        await prisma.parametro.delete({
            where: {
                chave,
            },
        });

        revalidatePath("/admin/parametros");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_PARAMETRO_ERROR]", error);
        return { success: false, error: "Erro ao deletar parâmetro" };
    }
}

export async function testSmtpConnection(config: SmtpConfig) {
    try {
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

        return { success: true, data: { message: "Conexão SMTP estabelecida com sucesso!" } };
    } catch (error: any) {
        console.error("SMTP Test Error:", error);
        return {
            success: false,
            error: "Falha na conexão SMTP. Verifique as configurações e tente novamente.",
            code: "SMTP_ERROR",
            metadata: { details: error.message }
        };
    }
}

export async function testWhatsAppConnection(config: WhatsAppTestConfig) {
    try {
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
            return { success: true, data: { message: "Conexão WhatsApp/Twilio estabelecida com sucesso!" } };
        } else {
            return {
                success: false,
                error: "Credenciais inválidas",
                code: "WHATSAPP_ERROR",
                metadata: { status: response.status }
            };
        }
    } catch (error: any) {
        console.error("WhatsApp Test Error:", error);
        return {
            success: false,
            error: "Falha na conexão WhatsApp. Verifique as credenciais e tente novamente.",
            code: "WHATSAPP_ERROR",
            metadata: { details: error.message }
        };
    }
}
