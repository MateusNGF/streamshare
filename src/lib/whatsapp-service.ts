/**
 * WhatsApp Notification Service
 * Bridges the PLANS feature-toggle and the Meta Cloud API provider.
 *
 * - Free/Pro  → wa.me link returned for manual sending
 * - Business  → automated Meta Cloud API dispatch
 */

import { prisma } from "@/lib/db";
import { TipoNotificacaoWhatsApp } from "@prisma/client";
import { PLANS } from "@/config/plans";
import { sendWhatsApp } from "@/lib/whatsapp-meta";
import type { WhatsAppSendResult } from "@/lib/whatsapp-meta";

export type { WhatsAppSendResult };

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Notification type enablement map
// ---------------------------------------------------------------------------

function isTypeEnabled(config: any, tipo: TipoNotificacaoWhatsApp): boolean {
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

// ---------------------------------------------------------------------------
// Main notification dispatcher
// ---------------------------------------------------------------------------

export async function sendWhatsAppNotification(
    contaId: number,
    tipo: TipoNotificacaoWhatsApp,
    participanteId: number,
    mensagem: string
): Promise<WhatsAppSendResult> {
    // 1. Load account plan config
    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
        include: { conta: { select: { plano: true } } },
    });

    if (!config || !config.isAtivo) {
        return { success: false, error: "account_disabled" };
    }

    // 2. Check notification type toggle
    if (!isTypeEnabled(config, tipo)) {
        return { success: false, error: "notification_type_disabled" };
    }

    // 3. Fetch participant number
    const participante = await prisma.participante.findUnique({
        where: { id: participanteId },
        select: { whatsappNumero: true, nome: true },
    });

    if (!participante?.whatsappNumero) {
        return { success: false, error: "participant_invalid_number" };
    }

    // 4. Determine if plan allows automation
    const automated = PLANS[config.conta.plano]?.automationEnabled === true;

    // 5. Send (automated for Business, link-only for Free/Pro)
    const result = await sendWhatsApp(participante.whatsappNumero, mensagem, automated);

    // 6. Log the attempt
    await prisma.whatsAppLog.create({
        data: {
            configId: config.id,
            participanteId,
            tipo,
            numeroDestino: participante.whatsappNumero,
            mensagem,
            enviado: result.success,
            erro: result.error,
            providerId: result.messageId,
        },
    });

    return result;
}
