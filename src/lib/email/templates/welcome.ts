import { getBaseTemplate } from "./base";
import { escapeHtml } from "../utils/html";

/**
 * Welcome Email Template
 * 
 * Generates HTML for welcome email with feature list and dashboard CTA.
 */

interface WelcomeTemplateProps {
    userName: string;
    dashboardUrl: string;
    replyTo: string;
}

export function getWelcomeTemplate({
    userName,
    dashboardUrl,
    replyTo,
}: WelcomeTemplateProps): string {
    const content = `
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: bold;">
            Olá, ${escapeHtml(userName)}!
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Estamos muito felizes em ter você no <strong>StreamShare</strong>! 🚀
        </p>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Agora você pode gerenciar suas assinaturas de streaming de forma simples e eficiente, 
            compartilhar custos com amigos e família, e manter tudo organizado em um só lugar.
        </p>
        
        <!-- Features -->
        <div style="margin: 30px 0;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: bold;">
                O que você pode fazer:
            </h3>
            
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">📺</span>
                        <span style="color: #4b5563; font-size: 15px;">Gerenciar múltiplas assinaturas de streaming</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">👥</span>
                        <span style="color: #4b5563; font-size: 15px;">Adicionar participantes e dividir custos</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">💰</span>
                        <span style="color: #4b5563; font-size: 15px;">Controlar cobranças e pagamentos</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">
                        <span style="color: #667eea; font-size: 20px; margin-right: 10px;">📊</span>
                        <span style="color: #4b5563; font-size: 15px;">Visualizar relatórios e estatísticas</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr>
                <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                        Acessar Dashboard
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Se tiver alguma dúvida, nossa equipe está sempre pronta para ajudar!
        </p>
    `;

    return getBaseTemplate({
        title: "Bem-vindo ao StreamShare",
        headerEmoji: "🎉",
        headerText: "Bem-vindo!",
        content,
        replyTo,
    });
}
