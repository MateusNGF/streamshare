/**
 * Base Email Template
 * 
 * Provides common HTML structure, styling, and layout for all email templates.
 * Includes header, footer, and responsive design.
 */

interface BaseTemplateProps {
    title: string;
    headerEmoji?: string;
    headerText: string;
    content: string;
    replyTo: string;
}

export function getBaseTemplate({
    title,
    headerEmoji = "🔐",
    headerText,
    content,
    replyTo,
}: BaseTemplateProps): string {
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${headerEmoji} ${headerText}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                                Enviado com ❤️ pela equipe StreamShare
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © ${currentYear} StreamShare. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Footer Text -->
                <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; text-align: center; max-width: 600px;">
                    Este é um email automático, por favor não responda. 
                    Se precisar de ajuda, entre em contato em ${replyTo}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
