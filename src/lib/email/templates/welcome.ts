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
        <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">
            Olá, ${escapeHtml(userName)}!
        </h2>
        
        <p style="margin: 0 0 24px; color: #475569; font-size: 17px; line-height: 1.6;">
            Você agora faz parte de uma comunidade que <strong>economiza de forma inteligente</strong> e desfruta do melhor do entretenimento sem complicações. 🚀
        </p>
        
        <p style="margin: 0 0 32px; color: #475569; font-size: 17px; line-height: 1.6;">
            O StreamShare foi criado para que você tenha controle total sobre suas assinaturas, dividindo custos de forma justa e organizada.
        </p>
        
        <!-- Features Section -->
        <div style="margin: 40px 0; padding: 32px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
            <h3 style="margin: 0 0 24px; color: #0f172a; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                Explore suas vantagens:
            </h3>
            
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                        <div style="width: 28px; height: 28px; background-color: #e0e7ff; border-radius: 8px; text-align: center; line-height: 28px;">
                            <span style="font-size: 16px;">📺</span>
                        </div>
                    </td>
                    <td style="padding: 12px 0 12px 12px;">
                        <strong style="display: block; color: #1e293b; font-size: 16px; margin-bottom: 2px;">Gestão Simplificada</strong>
                        <span style="color: #64748b; font-size: 14px;">Controle todas as suas assinaturas em um único painel.</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                        <div style="width: 28px; height: 28px; background-color: #e0e7ff; border-radius: 8px; text-align: center; line-height: 28px;">
                            <span style="font-size: 16px;">👥</span>
                        </div>
                    </td>
                    <td style="padding: 12px 0 12px 12px;">
                        <strong style="display: block; color: #1e293b; font-size: 16px; margin-bottom: 2px;">Divisão Automática</strong>
                        <span style="color: #64748b; font-size: 14px;">Adicione participantes e deixe que o sistema calcule as cotas.</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                        <div style="width: 28px; height: 28px; background-color: #e0e7ff; border-radius: 8px; text-align: center; line-height: 28px;">
                            <span style="font-size: 16px;">💰</span>
                        </div>
                    </td>
                    <td style="padding: 12px 0 12px 12px;">
                        <strong style="display: block; color: #1e293b; font-size: 16px; margin-bottom: 2px;">Pagamentos Seguros</strong>
                        <span style="color: #64748b; font-size: 14px;">Acompanhe cobranças e recebimentos com total transparência.</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 40px 0;">
            <tr>
                <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 18px 48px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 17px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); transition: all 0.2s;">
                        Acessar meu Dashboard
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 32px 0 0; color: #64748b; font-size: 15px; text-align: center; font-style: italic;">
            "O entretenimento que você ama, pelo preço que você merece."
        </p>
    `;

    return getBaseTemplate({
        title: "Bem-vindo ao StreamShare",
        headerEmoji: "⚡",
        headerText: "Bem-vindo!",
        content,
        replyTo,
    });
}

