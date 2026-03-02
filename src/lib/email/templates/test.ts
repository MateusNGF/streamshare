import { getBaseTemplate } from "./base";

/**
 * Test Email Template
 * 
 * Generates HTML for connection test email.
 */

interface TestTemplateProps {
    timestamp: string;
    host: string;
    origin?: string;
    replyTo: string;
}

export function getTestTemplate({
    timestamp,
    host,
    origin = process.env.NEXT_PUBLIC_URL,
    replyTo,
}: TestTemplateProps): string {
    const content = `
        <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">
            Sucesso! 🚀
        </h2>
        
        <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
            Este é um e-mail de teste enviado pelo sistema <strong>StreamShare</strong> para validar sua integração.
        </p>
        
        <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
            Se você está vendo esta mensagem, significa que suas configurações de SMTP estão funcionando perfeitamente!
        </p>
        
        <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 16px; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Detalhes técnicos:</p>
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">📅 Enviado em:</td>
                    <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">${timestamp}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">🌐 Host:</td>
                    <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;"><code>${host}</code></td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">🔗 Domínio:</td>
                    <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">${origin}</td>
                </tr>
            </table>
        </div>
        
        <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
            Nenhuma ação adicional é necessária. Você pode arquivar este e-mail.
        </p>
    `;

    return getBaseTemplate({
        title: "Teste de Conexão - StreamShare",
        headerEmoji: "🚀",
        headerText: "Tudo pronto!",
        content,
        replyTo,
    });
}

