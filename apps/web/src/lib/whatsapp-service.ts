import { prisma } from "@streamshare/database";
import { TipoNotificacaoWhatsApp } from "@streamshare/database";
import crypto from "crypto";

// Função para descriptografar credenciais
function decrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY || "default-encryption-key-change-me";
    const decipher = crypto.createDecipher("aes-256-cbc", key);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

// Função para normalizar número no formato E.164 (internacional)
function normalizePhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos exceto o +
    let normalized = phone.replace(/[^\d+]/g, '');

    // Se já começa com +, retorna como está
    if (normalized.startsWith('+')) {
        return normalized;
    }

    // Se tem 11 dígitos (celular BR: DDI + DDD + número)
    // Exemplo: 11999999999 -> +5511999999999
    if (normalized.length === 11 && !normalized.startsWith('55')) {
        return `+55${normalized}`;
    }

    // Se tem 13 dígitos e começa com 55 (já tem DDI mas sem +)
    if (normalized.length === 13 && normalized.startsWith('55')) {
        return `+${normalized}`;
    }

    // Se tem 10 dígitos (fixo BR: DDD + número)
    if (normalized.length === 10 && !normalized.startsWith('55')) {
        return `+55${normalized}`;
    }

    // Se tem 12 dígitos e começa com 55
    if (normalized.length === 12 && normalized.startsWith('55')) {
        return `+${normalized}`;
    }

    // Caso contrário, assume que precisa adicionar +55
    return `+55${normalized}`;
}

// Twilio Provider
class TwilioProvider {
    constructor(
        private accountSid: string,
        private authToken: string,
        private fromNumber: string
    ) { }

    async sendMessage(to: string, message: string): Promise<{ success: boolean; providerId?: string; error?: string }> {
        try {
            // Normalize phone numbers to E.164 format
            const normalizedTo = normalizePhoneNumber(to);

            // Ensure proper WhatsApp format for both numbers
            const fromWhatsApp = this.fromNumber.startsWith('whatsapp:')
                ? this.fromNumber
                : `whatsapp:${this.fromNumber}`;

            const toWhatsApp = normalizedTo.startsWith('whatsapp:')
                ? normalizedTo
                : `whatsapp:${normalizedTo}`;

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        From: fromWhatsApp,
                        To: toWhatsApp,
                        Body: message,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || "Erro ao enviar mensagem"
                };
            }

            return {
                success: true,
                providerId: data.sid
            };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }
}

// Função principal para enviar notificação
export async function sendWhatsAppNotification(
    contaId: number,
    tipo: TipoNotificacaoWhatsApp,
    participanteId: number,
    mensagem: string
) {
    // Buscar configuração da conta
    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });

    // Se não tiver configuração ou estiver inativa, retorna silenciosamente
    if (!config || !config.isAtivo) {
        return { success: false, reason: "not_configured" };
    }

    // Verificar se notificação deste tipo está habilitada
    const tipoHabilitado = verificarTipoHabilitado(config, tipo);
    if (!tipoHabilitado) {
        return { success: false, reason: "notification_disabled" };
    }

    // Buscar número do participante
    const participante = await prisma.participante.findUnique({
        where: { id: participanteId },
        select: { whatsappNumero: true },
    });

    if (!participante) {
        return { success: false, reason: "participant_not_found" };
    }

    // **DESCRIPTOGRAFAR CREDENCIAIS**
    const accountSid = decrypt(config.apiKey);
    const authToken = decrypt(config.apiSecret || "");
    const fromNumber = config.phoneNumber || "";

    // Criar provider Twilio e enviar mensagem
    try {
        const provider = new TwilioProvider(
            accountSid,    // Account SID descriptografado
            authToken,     // Auth Token descriptografado
            fromNumber     // From Number (já está em plain text)
        );
        const result = await provider.sendMessage(participante.whatsappNumero, mensagem);

        // Logar tentativa
        await prisma.whatsAppLog.create({
            data: {
                configId: config.id,
                participanteId,
                tipo,
                numeroDestino: participante.whatsappNumero,
                mensagem,
                enviado: result.success,
                erro: result.error,
                providerId: result.providerId,
            },
        });

        return result;
    } catch (error) {
        // Logar erro
        await prisma.whatsAppLog.create({
            data: {
                configId: config.id,
                participanteId,
                tipo,
                numeroDestino: participante.whatsappNumero,
                mensagem,
                enviado: false,
                erro: (error as Error).message,
            },
        });

        return { success: false, error: (error as Error).message };
    }
}

function verificarTipoHabilitado(config: any, tipo: TipoNotificacaoWhatsApp): boolean {
    const map: Record<TipoNotificacaoWhatsApp, string> = {
        nova_assinatura: "notificarNovaAssinatura",
        cobranca_gerada: "notificarCobrancaGerada",
        cobranca_vencendo: "notificarCobrancaVencendo",
        cobranca_atrasada: "notificarCobrancaAtrasada",
        assinatura_suspensa: "notificarAssinaturaSuspensa",
        pagamento_confirmado: "notificarPagamentoConfirmado",
    };

    return config[map[tipo]] === true;
}

// Templates de mensagens
export const whatsappTemplates = {
    novaAssinatura: (participante: string, streaming: string, valor: string, dataInicio: string) =>
        `Olá ${participante}! ✨\n\nSua assinatura de *${streaming}* foi confirmada!\n\n💰 Valor: ${valor}\n📅 Início: ${dataInicio}\n\nEm breve você receberá as credenciais de acesso.`,

    cobrancaGerada: (participante: string, streaming: string, valor: string, vencimento: string) =>
        `Olá ${participante}! 📝\n\nNova cobrança gerada para *${streaming}*:\n\n💰 Valor: ${valor}\n📅 Vencimento: ${vencimento}\n\nAguardamos seu pagamento!`,

    cobrancaVencendo: (participante: string, streaming: string, valor: string, dias: number) =>
        `Lembrete: Sua cobrança de *${streaming}* vence em ${dias} dia(s)! ⏰\n\n💰 Valor: ${valor}\n\nEvite suspensão do serviço realizando o pagamento.`,

    cobrancaAtrasada: (participante: string, streaming: string, valor: string, diasAtraso: number) =>
        `⚠️ ${participante}, sua cobrança de *${streaming}* está ${diasAtraso} dia(s) em atraso.\n\n💰 Valor: ${valor}\n\nRealize o pagamento para manter seu acesso ativo.`,

    assinaturaSuspensa: (participante: string, streaming: string) =>
        `❌ ${participante}, sua assinatura de *${streaming}* foi suspensa por falta de pagamento.\n\nRegularize para reativar o acesso.`,

    pagamentoConfirmado: (participante: string, streaming: string, valor: string) =>
        `✅ ${participante}, pagamento confirmado!\n\n*${streaming}*\n💰 ${valor}\n\nObrigado! Seu acesso continua ativo.`,
};
