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
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: bold;">
            Sucesso! 🚀
        </h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Este é um email de teste enviado pelo sistema <strong>StreamShare</strong>.
        </p>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Se você recebeu este email, as configurações de SMTP no arquivo <code>.env</code> estão configuradas corretamente.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px; font-weight: bold;">Detalhes da Conexão:</p>
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">📅 Enviado em:</td>
                    <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${timestamp}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">🌐 SMTP Host:</td>
                    <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${host}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">🔗 Origem:</td>
                    <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${origin}</td>
                </tr>
            </table>
        </div>
        
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Nada mais precisa ser feito. Você pode apagar este email.
        </p>
    `;

    return getBaseTemplate({
        title: "Teste de Conexão - StreamShare",
        headerEmoji: "🚀",
        headerText: "Teste de SMTP",
        content,
        replyTo,
    });
}
