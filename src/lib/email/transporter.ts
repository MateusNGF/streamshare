import nodemailer from "nodemailer";

/**
 * Email Transporter
 * 
 * Manages SMTP transporter creation with support for:
 * - Gmail, Outlook, and custom SMTP servers
 * - Ethereal Email for development/testing
 * - Build-time fallback
 */

// Cache do transporter para reutilização
let cachedTransporter: nodemailer.Transporter | null = null;
let etherealAccount: { user: string; pass: string } | null = null;

/**
 * Cria transporter do Nodemailer
 * Suporta Gmail, Outlook, SMTP customizado, ou Ethereal para testes
 */
export async function createTransporter(): Promise<nodemailer.Transporter> {
    // Se já temos um transporter em cache, reutilizar
    if (cachedTransporter) {
        return cachedTransporter;
    }

    // Se configuração SMTP existe, usar SMTP real
    if (process.env.SMTP_HOST) {
        cachedTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Permite certificados auto-assinados caso o servidor SMTP os utilize
                rejectUnauthorized: false
            }
        });

        console.log("📧 SMTP configurado:", process.env.SMTP_HOST);
        return cachedTransporter;
    }

    // Durante build time, retornar transporter fake
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
        console.log("🏗️ Build mode: usando transporter fake");
        cachedTransporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
        return cachedTransporter;
    }

    // Sem SMTP configurado: usar Ethereal Email para testes
    console.log("🧪 SMTP não configurado. Usando Ethereal Email para testes...");

    try {
        // Criar conta de teste Ethereal (ou reutilizar se já existe)
        if (!etherealAccount) {
            etherealAccount = await nodemailer.createTestAccount();
            console.log("✅ Conta Ethereal criada:");
            console.log("   📧 User:", etherealAccount.user);
            console.log("   🔑 Pass:", etherealAccount.pass);
            console.log("   🌐 Preview: https://ethereal.email");
        }

        cachedTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: etherealAccount.user,
                pass: etherealAccount.pass,
            },
            tls: {
                // Aceitar certificados auto-assinados em desenvolvimento
                rejectUnauthorized: false
            }
        });

        return cachedTransporter;
    } catch (error) {
        console.error("❌ Erro ao criar conta Ethereal:", error);

        // Fallback: transporter fake que apenas loga
        cachedTransporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });

        return cachedTransporter;
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
