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
    <style>
        /* Modern Font Smoothing */
        body { 
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale; 
            text-rendering: optimizeLegibility;
        }

        /* Responsive Improvements */
        @media screen and (max-width: 600px) {
            .container { padding: 20px 10px !important; }
            .content-box { border-radius: 12px !important; }
            .header { padding: 30px 20px !important; }
            .content { padding: 25px 20px !important; }
            .footer { padding: 25px 20px !important; }
            h1 { font-size: 24px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                <table role="presentation" class="content-box" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td class="header" style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 800; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${headerEmoji} ${headerText}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content" style="padding: 48px 48px 32px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer" style="padding: 32px 48px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px; color: #475569; font-size: 15px; font-weight: 500;">
                                            Abraços,<br>
                                            <strong style="color: #6366f1;">Mateus da StreamShare</strong>
                                        </p>
                                        <p style="margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.5;">
                                            Adoramos ouvir nossos usuários! Se você tiver qualquer dúvida ou sugestão, sinta-se à vontade para responder a este e-mail.
                                        </p>
                                        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: left;">
                                                © ${currentYear} StreamShare. Todos os direitos reservados.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <!-- Secondary Footer Text -->
                <p style="margin: 24px 0 0; color: #94a3b8; font-size: 12px; text-align: center; max-width: 600px; line-height: 1.6;">
                    Você recebeu este e-mail porque se cadastrou no StreamShare.<br>
                    Se precisar de suporte técnico, acesse nossa central em ${replyTo}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

