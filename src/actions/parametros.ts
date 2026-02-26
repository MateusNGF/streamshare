"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { encrypt, safeDecrypt, isEncrypted } from "@/lib/encryption";

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
            const isSensitive = SENSITIVE_KEYWORDS.some(keyword => data.chave.toLowerCase().includes(keyword));
            updateData.valor = isSensitive ? encrypt(data.valor) : data.valor;
        }

        const parametro = await prisma.parametro.upsert({
            where: {
                chave: data.chave,
            },
            create: {
                chave: data.chave,
                valor: data.valor === "********" ? "" : (SENSITIVE_KEYWORDS.some(keyword => data.chave.toLowerCase().includes(keyword)) ? encrypt(data.valor) : data.valor),
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
                        valor: data.valor === "********" ? "" : (SENSITIVE_KEYWORDS.some(keyword => data.chave.toLowerCase().includes(keyword)) ? encrypt(data.valor) : data.valor),
                        tipo: data.tipo || "string",
                        descricao: data.descricao,
                    },
                    update: {
                        ...updateData,
                        valor: (data.valor !== "********" && SENSITIVE_KEYWORDS.some(keyword => data.chave.toLowerCase().includes(keyword)))
                            ? encrypt(data.valor)
                            : updateData.valor
                    },
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
export async function testSmtpConnection() {
    try {
        const session = await getCurrentUser();
        if (!session) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        const destinatario = session.email;

        const { createTransporter } = await import("@/lib/email/transporter");
        const { sendTestEmail } = await import("@/lib/email");

        // 1. Primeiro verifica a conexão (handshake)
        const transporter = await createTransporter();
        await transporter.verify();

        // 2. Tenta enviar um email real de teste para o próprio admin logado
        const result = await sendTestEmail(destinatario);

        if (result.success) {
            return {
                success: true,
                data: {
                    message: `Conexão SMTP OK e email de teste enviado para ${destinatario}!`,
                    details: `Message ID: ${result.messageId} | Host: ${process.env.SMTP_HOST || "Ethereal"}`
                }
            };
        } else {
            return {
                success: false,
                error: "Conexão SMTP estabelecida, mas falhou ao enviar o e-mail de teste.",
                code: "SEND_ERROR",
                metadata: { details: result.error }
            };
        }
    } catch (error: any) {
        console.error("SMTP Test Error:", error);
        return {
            success: false,
            error: "Falha na conexão SMTP (verifique as variáveis de ambiente).",
            code: "SMTP_ERROR",
            metadata: { details: error.message }
        };
    }
}

export async function testWhatsAppConnection() {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";

        if (!accessToken || !phoneNumberId) {
            return {
                success: false,
                error: "Configurações da Meta Cloud API incompletas no .env (WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID são obrigatórios).",
                code: "CONFIG_MISSING"
            };
        }

        // Validates token + phone number by fetching the phone number profile
        const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}?fields=display_phone_number,verified_name`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                data: {
                    message: `Conexão Meta Cloud API OK! Número: ${data.display_phone_number ?? phoneNumberId} (${data.verified_name ?? "sem nome verificado"})`,
                    details: `API Version: ${apiVersion}`
                }
            };
        } else {
            return {
                success: false,
                error: data?.error?.message ?? "Credenciais Meta Cloud API inválidas.",
                code: "WHATSAPP_ERROR",
                metadata: { status: response.status, meta: data?.error }
            };
        }
    } catch (error: any) {
        console.error("[WhatsApp Meta API Test Error]", error);
        return {
            success: false,
            error: "Falha na conexão com a Meta Cloud API.",
            code: "WHATSAPP_ERROR",
            metadata: { details: error.message }
        };
    }
}

export async function getConfigParams() {
    try {
        const isAdmin = await validateAdmin();
        if (!isAdmin.success) return isAdmin;

        return {
            success: true,
            data: {
                smtp: {
                    host: process.env.SMTP_HOST || "Não configurado",
                    port: process.env.SMTP_PORT || "587",
                    user: process.env.SMTP_USER || "Não configurado",
                    secure: process.env.SMTP_SECURE || "false",
                    fromEmail: process.env.EMAIL_FROM || "Não configurado",
                },
                whatsapp: {
                    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? "****" + process.env.WHATSAPP_PHONE_NUMBER_ID.slice(-4) : "Não configurado",
                    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
                    enabled: process.env.WHATSAPP_ENABLED || "false",
                }
            }
        };
    } catch (error: any) {
        console.error("[GET_CONFIG_PARAMS_ERROR]", error);
        return { success: false, error: "Erro ao buscar parâmetros de ambiente" };
    }
}
