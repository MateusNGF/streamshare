import { prisma } from "@/lib/db";
import { TipoNotificacaoWhatsApp } from "@prisma/client";
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

    // Se não tem +, adiciona (assume que o número já vem com código do país)
    return `+${normalized}`;
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
            console.error("Twilio sendMessage Error:", error);
            return {
                success: false,
                error: "Falha ao enviar mensagem pelo provedor."
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
    // ------------------------------------------------------------------
    // LINK ONLY MODE (TEMPORARY)
    // ------------------------------------------------------------------
    // Keep internal logic but do NOT call external provider.
    // This allows the system to "think" it sent, so we can mock success.
    const LINK_ONLY_MODE = true;

    if (LINK_ONLY_MODE) {
        console.log(`[WhatsApp Mock] Would send to participant ${participanteId}: ${mensagem}`);
        // We can optionally log to database still if we want to track "attempts"
        // For now, just return success so the flow continues.
        return {
            success: true,
            providerId: "mock-link-only-mode"
        };
    }

    // 1. Buscar parâmetros globais do sistema
    const parametros = await prisma.parametro.findMany({
        where: {
            chave: {
                in: [
                    "whatsapp.enabled",
                    "whatsapp.account_sid",
                    "whatsapp.auth_token",
                    "whatsapp.phone_number"
                ]
            }
        }
    });

    const getParam = (key: string) => parametros.find(p => p.chave === key)?.valor;

    const globalEnabled = getParam("whatsapp.enabled") === "true";
    const accountSid = getParam("whatsapp.account_sid");
    const authToken = getParam("whatsapp.auth_token");
    const fromNumber = getParam("whatsapp.phone_number");

    // Se a integração global estiver desativada ou faltar credenciais, aborta
    if (!globalEnabled || !accountSid || !authToken || !fromNumber) {
        return { success: false, reason: "system_not_configured" };
    }

    // 2. Buscar configuração específica da conta (preferências)
    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });

    // Se a conta não tiver configuração ou estiver inativa, retorna silenciosamente
    if (!config || !config.isAtivo) {
        return { success: false, reason: "account_disabled" };
    }

    // 3. Verificar se notificação deste tipo está habilitada para ESTA conta
    const tipoHabilitado = verificarTipoHabilitado(config, tipo);
    if (!tipoHabilitado) {
        return { success: false, reason: "notification_type_disabled" };
    }

    // 4. Buscar número do participante
    const participante = await prisma.participante.findUnique({
        where: { id: participanteId },
        select: { whatsappNumero: true },
    });

    if (!participante || !participante.whatsappNumero) {
        return { success: false, reason: "participant_invalid_number" };
    }

    // 5. Enviar mensagem usando as credenciais globais
    try {
        const provider = new TwilioProvider(
            accountSid,
            authToken,
            fromNumber
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

        console.error("sendWhatsAppNotification generic catch error:", error);
        return { success: false, error: "Erro interno ao enviar notificação WhatsApp" };
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
