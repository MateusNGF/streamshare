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
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 64px; height: 64px; background-color: #f1f5f9; border-radius: 50%; text-align: center; line-height: 64px; margin-bottom: 16px;">
                <span style="font-size: 32px;">🛡️</span>
            </div>
            <h2 style="margin: 0; color: #0f172a; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">
                Proteja sua conta
            </h2>
        </div>
        
        ${userName ? `<p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">Olá, <strong>${escapeHtml(userName)}</strong>!</p>` : ""}
        
        <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta no <strong>StreamShare</strong>. 
            Se foi você, clique no botão abaixo para escolher uma nova senha:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
            <tr>
                <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 18px 48px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 17px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">
                        Redefinir minha senha
                    </a>
                </td>
            </tr>
        </table>
        
        <!-- Warning Box -->
        <div style="margin: 40px 0; padding: 24px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="vertical-align: top; width: 24px;">
                        <span style="font-size: 18px;">⚠️</span>
                    </td>
                    <td style="padding-left: 12px;">
                        <p style="margin: 0 0 4px; color: #92400e; font-size: 15px; font-weight: 700;">
                            Atenção à validade
                        </p>
                        <p style="margin: 0; color: #b45309; font-size: 14px; line-height: 1.5;">
                            Por segurança, este link é válido por apenas <strong>1 hora</strong>. Após esse período, você precisará solicitar um novo.
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Alternative Link -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0 0 12px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                Problemas com o botão?
            </p>
            <p style="margin: 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #475569; border: 1px solid #f1f5f9;">
                ${resetUrl}
            </p>
        </div>
        
        <p style="margin: 32px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
            Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha não será alterada.
        </p>
    `;

    return getBaseTemplate({
        title: "Redefinir Senha - StreamShare",
        headerEmoji: "🔐",
        headerText: "Segurança",
        content,
        replyTo,
    });
}

