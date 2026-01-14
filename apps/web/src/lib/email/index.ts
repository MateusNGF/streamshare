import { createTransporter, logPreviewUrl } from "./transporter";
import { getPasswordResetTemplate } from "./templates/password-reset";
import { getWelcomeTemplate } from "./templates/welcome";

/**
 * Email Service
 * 
 * Main module for sending emails with clean, modular architecture.
 */

// Configurações de email
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || "StreamShare <noreply@streamshare.com>",
    replyTo: process.env.EMAIL_REPLY_TO || "suporte@streamshare.com",
};

/**
 * Envia email de recuperação de senha
 * @param email Email do destinatário
 * @param token Token de reset de senha
 * @param userName Nome do usuário (opcional)
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string,
    userName?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const resetUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/redefinir-senha/${token}`;
        const transporter = await createTransporter();

        const html = getPasswordResetTemplate({
            resetUrl,
            userName,
            replyTo: EMAIL_CONFIG.replyTo,
        });

        const info = await transporter.sendMail({
            from: EMAIL_CONFIG.from,
            to: email,
            replyTo: EMAIL_CONFIG.replyTo,
            subject: "Redefinir sua senha - StreamShare",
            html,
        });

        console.log("✅ Email enviado:", info.messageId);
        logPreviewUrl(info);

        return { success: true };
    } catch (error: any) {
        console.error("❌ Erro ao enviar email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Envia email de boas-vindas
 * @param email Email do destinatário
 * @param userName Nome do usuário
 */
export async function sendWelcomeEmail(
    email: string,
    userName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard`;
        const transporter = await createTransporter();

        const html = getWelcomeTemplate({
            userName,
            dashboardUrl,
            replyTo: EMAIL_CONFIG.replyTo,
        });

        const info = await transporter.sendMail({
            from: EMAIL_CONFIG.from,
            to: email,
            replyTo: EMAIL_CONFIG.replyTo,
            subject: "Bem-vindo ao StreamShare! 🎉",
            html,
        });

        console.log("✅ Email de boas-vindas enviado:", info.messageId);
        logPreviewUrl(info);

        return { success: true };
    } catch (error: any) {
        console.error("❌ Erro ao enviar email:", error);
        return { success: false, error: error.message };
    }
}
