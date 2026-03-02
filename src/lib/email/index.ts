import { createTransporter, logPreviewUrl } from "./transporter";
import { getPasswordResetTemplate } from "./templates/password-reset";
import { getWelcomeTemplate } from "./templates/welcome";
import { getTestTemplate } from "./templates/test";
import { getLoteAprovadoTemplate, getLoteRejeitadoTemplate } from "./templates/lote-pagamento";

/**
 * Email Service
 * 
 * Main module for sending emails with clean, modular architecture.
 */

/**
 * Helper para obter configurações de email atualizadas
 */
function getEmailConfig() {
    return {
        from: process.env.EMAIL_FROM || "StreamShare <atendimento@streamshare.com.br>",
        replyTo: process.env.EMAIL_REPLY_TO || "atendimento@streamshare.com.br",
    };
}

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
        const config = getEmailConfig();
        const resetUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/redefinir-senha/${token}`;
        const transporter = await createTransporter();

        const html = getPasswordResetTemplate({
            resetUrl,
            userName,
            replyTo: config.replyTo,
        });

        const info = await transporter.sendMail({
            from: config.from,
            to: email,
            replyTo: config.replyTo,
            subject: "Redefinir sua senha - StreamShare",
            html,
        });

        console.log("✅ Email de reset enviado:", info.messageId);
        return { success: true };
    } catch (error: any) {
        console.error("❌ Erro ao enviar email de reset:", error);
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
        const config = getEmailConfig();
        const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard`;
        const transporter = await createTransporter();

        const html = getWelcomeTemplate({
            userName,
            dashboardUrl,
            replyTo: config.replyTo,
        });

        const info = await transporter.sendMail({
            from: config.from,
            to: email,
            replyTo: config.replyTo,
            subject: "Bem-vindo ao StreamShare! 🎉",
            html,
        });

        console.log("✅ Email de boas-vindas enviado:", info.messageId);
        console.log("📊 Stats - Aceitos:", info.accepted, "Rejeitados:", info.rejected);
        logPreviewUrl(info);

        return { success: true };
    } catch (error: any) {
        console.error("❌ Erro ao enviar email de boas-vindas:", error);
        return { success: false, error: error.message };
    }
}


/**
 * Envia um email de teste (Diagnóstico)
 * @param email Email do destinatário
 */
export async function sendTestEmail(
    email: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const config = getEmailConfig();
        const transporter = await createTransporter();
        const now = new Date().toLocaleString("pt-BR");

        const html = getTestTemplate({
            timestamp: now,
            host: process.env.SMTP_HOST || "Ethereal/Stream",
            replyTo: config.replyTo,
        });

        const info = await transporter.sendMail({
            from: config.from,
            to: email,
            subject: "Teste de Conexão SMTP - StreamShare",
            html,
        });


        console.log("✅ Email de teste enviado:", info.messageId);
        console.log("📊 Resposta SMTP:", info.response);
        console.log("📊 Stats - Aceitos:", info.accepted, "Rejeitados:", info.rejected);
        logPreviewUrl(info);

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("❌ Erro ao enviar email de teste:", error);
        return { success: false, error: error.message };
    }
}
/**
 * Generic transactional email sender.
 * Used by the OTP verification engine and other internal services.
 */
export async function sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const config = getEmailConfig();
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: config.from,
            to: opts.to,
            replyTo: config.replyTo,
            subject: opts.subject,
            html: opts.html,
            text: opts.text,
        });

        console.log(`✅ [sendEmail] Enviado para ${opts.to} | Subject: "${opts.subject}" | ID: ${info.messageId}`);
        logPreviewUrl(info);

        return { success: true };
    } catch (error: any) {
        console.error(`❌ [sendEmail] Falha ao enviar para ${opts.to}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Envia email de lote de pagamento aprovado
 */
export async function sendLoteAprovadoEmail(opts: {
    to: string;
    participanteNome: string;
    loteId: number;
    quantidadeItens: number;
    valorTotal: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const config = getEmailConfig();
        const html = getLoteAprovadoTemplate({
            participanteNome: opts.participanteNome,
            loteId: opts.loteId,
            quantidadeItens: opts.quantidadeItens,
            valorTotal: opts.valorTotal,
            replyTo: config.replyTo,
        });

        return await sendEmail({
            to: opts.to,
            subject: `Pagamento Confirmado! Lote #${opts.loteId} 🎉`,
            html,
        });
    } catch (error: any) {
        console.error("❌ Erro ao enviar email de lote aprovado:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Envia email de lote de pagamento rejeitado
 */
export async function sendLoteRejeitadoEmail(opts: {
    to: string;
    participanteNome: string;
    loteId: number;
    motivo: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const config = getEmailConfig();
        const html = getLoteRejeitadoTemplate({
            participanteNome: opts.participanteNome,
            loteId: opts.loteId,
            motivo: opts.motivo,
            replyTo: config.replyTo,
        });

        return await sendEmail({
            to: opts.to,
            subject: `Ação Necessária: Pagamento Rejeitado (Lote #${opts.loteId}) ⚠️`,
            html,
        });
    } catch (error: any) {
        console.error("❌ Erro ao enviar email de lote rejeitado:", error);
        return { success: false, error: error.message };
    }
}
