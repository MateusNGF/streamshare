import nodemailer from "nodemailer";

/**
 * Email Transporter
 * 
 * Manages SMTP transporter creation with support for:
 * - Gmail, Outlook, and custom SMTP servers
 * - Ethereal Email for development/testing
 * - Build-time fallback
 */

/**
 * Email Transporter
 * 
 * Manages SMTP transporter creation with support for:
 * - Hostinger, Gmail, Outlook, and custom SMTP servers
 * - Ethereal Email for development/testing
 * - Build-time fallback for Next.js
 */

// Global state for Ethereal account only (speeds up dev)
let etherealAccount: { user: string; pass: string } | null = null;

/**
 * Cria transporter do Nodemailer
 * Suporta SMTP real via env vars, ou Ethereal para testes localmente
 */
export async function createTransporter(): Promise<nodemailer.Transporter> {
    // 1. Durante build-time do Next.js, retornar transporter fake (stream)
    // Isso evita que o build falhe ou tente conectar em serviço externo
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.log("🏗️ Next.js Build Phase: usando transporter de stream");
        return nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
    }

    // 2. Se configuração SMTP existe, usar SMTP real
    if (process.env.SMTP_HOST) {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        console.log(`📡 Criando transporter SMTP Real: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (Secure: ${process.env.SMTP_SECURE})`);

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: user,
                pass: pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // 3. Sem SMTP configurado: usar Ethereal Email para testes em dev
    try {
        if (!etherealAccount && process.env.NODE_ENV === 'development') {
            console.log("🧪 SMTP não configurado. Criando conta Ethereal para testes...");
            etherealAccount = await nodemailer.createTestAccount();
            console.log("✅ Conta Ethereal criada:");
            console.log("   📧 User:", etherealAccount.user);
            console.log("   🔑 Pass:", etherealAccount.pass);
        }

        if (etherealAccount) {
            return nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: etherealAccount.user,
                    pass: etherealAccount.pass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
    } catch (error) {
        console.error("❌ Erro ao criar conta Ethereal:", error);
    }

    // 4. Fallback final: transporter fake que apenas loga
    console.warn("⚠️ Fallback: nenhum provedor de email configurado. Usando stream transport.");
    return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
    });
}

/**
 * Valida se a conexão SMTP está funcionando
 */
export async function verifyTransporter(): Promise<{ success: boolean; error?: string }> {
    try {
        const transporter = await createTransporter();
        await transporter.verify();
        return { success: true };
    } catch (error: any) {
        console.error("❌ Falha na verificação do SMTP:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Logs preview URL for Ethereal emails
 */
export function logPreviewUrl(info: nodemailer.SentMessageInfo): void {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log("🔗 Preview URL:", previewUrl);
    }
}

