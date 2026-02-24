import { getBaseTemplate } from "./base";
import { escapeHtml } from "../utils/html";

/**
 * Password Reset Email Template
 * 
 * Generates HTML for password reset email with reset link and instructions.
 */

interface PasswordResetTemplateProps {
    resetUrl: string;
    userName?: string;
    replyTo: string;
}

export function getPasswordResetTemplate({
    resetUrl,
    userName,
    replyTo,
}: PasswordResetTemplateProps): string {
    const content = `
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: bold;">
            Redefinir sua senha
        </h2>
        
        ${userName ? `<p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">Olá, <strong>${escapeHtml(userName)}</strong>!</p>` : ""}
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta StreamShare. 
            Clique no botão abaixo para criar uma nova senha:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr>
                <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                        Redefinir Senha
                    </a>
                </td>
            </tr>
        </table>
        
        <!-- Alternative Link -->
        <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Ou copie e cole este link no seu navegador:
        </p>
        <p style="margin: 0 0 20px; padding: 12px; background-color: #f9fafb; border-radius: 8px; word-break: break-all; font-size: 14px; color: #4b5563;">
            ${resetUrl}
        </p>
        
        <!-- Warning Box -->
        <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Importante:</strong> Este link expira em <strong>1 hora</strong> por motivos de segurança.
            </p>
        </div>
        
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Se você não solicitou a redefinição de senha, ignore este email. 
            Sua senha permanecerá inalterada.
        </p>
    `;

    return getBaseTemplate({
        title: "Redefinir Senha - StreamShare",
        headerEmoji: "🔐",
        headerText: "StreamShare",
        content,
        replyTo,
    });
}
