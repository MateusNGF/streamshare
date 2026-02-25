import { prisma } from "@/lib/db";
import { TipoNotificacaoWhatsApp } from "@prisma/client";
import { PLANS } from "@/config/plans";
import crypto from "crypto";
import { safeDecrypt } from "@/lib/encryption";

// Redundant local decrypt removed as we use the centralized one in @/lib/encryption

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

// Meta WhatsApp Cloud API Provider
class MetaWhatsAppProvider {
    constructor(
        private accessToken: string,
        private phoneNumberId: string,
        private apiVersion: string = 'v21.0'
    ) { }

    async sendMessage(to: string, message: string): Promise<{ success: boolean; providerId?: string; error?: string }> {
        try {
            // Normalize phone numbers to E.164 format and remove '+' for Meta API
            const normalizedTo = normalizePhoneNumber(to).replace('+', '');

            // The Meta Cloud API uses /messages endpoint
            const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

            const payload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: normalizedTo,
                type: "text",
                text: {
                    preview_url: false,
                    body: message
                }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Meta API Error Details:", data);
                return {
                    success: false,
                    error: data.error?.message || "Erro ao enviar mensagem pela API Oficial"
                };
            }

            return {
                success: true,
                // Meta API returns messages array with the message ID
                providerId: data.messages && data.messages.length > 0 ? data.messages[0].id : undefined
            };
        } catch (error) {
            console.error("Meta sendMessage Error:", error);
            return {
                success: false,
                error: "Falha ao comunicar com a API do Meta."
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

    // 1. Buscar parâmetros globais do sistema de variáveis de ambiente
    const globalEnabled = process.env.WHATSAPP_ENABLED === "true";
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

    // Se a integração global estiver desativada ou faltar credenciais, aborta
    if (!globalEnabled || !accessToken || !phoneNumberId) {
        return { success: false, reason: "system_not_configured" };
    }

    // 2. Buscar configuração específica da conta (preferências)
    // 2. Buscar configuração específica da conta (preferências)
    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
        include: { conta: { select: { plano: true } } }
    });

    // Se a conta não tiver configuração ou estiver inativa, retorna silenciosamente
    if (!config || !config.isAtivo) {
        return { success: false, reason: "account_disabled" };
    }

    // Check Plan Automation
    // Note: We use type assertion or ignore if type definition is outdated until prisma generate runs
    // @ts-ignore
    if (!PLANS[config.conta.plano]?.automationEnabled) {
        return { success: false, reason: "plan_restricted" };
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
        const provider = new MetaWhatsAppProvider(
            accessToken,
            phoneNumberId,
            apiVersion
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
