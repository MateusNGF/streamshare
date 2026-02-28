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
import type { WhatsAppSendResult, WhatsAppTemplateConfig } from "@/lib/whatsapp-meta";

export type { WhatsAppSendResult };

export interface EnvioWhatsAppObj {
    texto: string;
    template: WhatsAppTemplateConfig;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const whatsappTemplates = {
    novaAssinatura: (participante: string, streaming: string, valor: string, dataInicio: string): EnvioWhatsAppObj => ({
        texto: `Olá ${participante}! ✨\n\nSua assinatura de *${streaming}* foi confirmada!\n\n💰 Valor: ${valor}\n📅 Início: ${dataInicio}\n\nEm breve você receberá as credenciais de acesso.`,
        template: {
            name: "nova_assinatura", // Placeholder para o nome exato aprovado na WABA
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: streaming },
                        { type: "text", text: valor },
                        { type: "text", text: dataInicio },
                    ]
                }
            ]
        }
    }),

    cobrancaGerada: (participante: string, streaming: string, valor: string, vencimento: string): EnvioWhatsAppObj => ({
        texto: `Olá ${participante}! 📝\n\nNova cobrança gerada para *${streaming}*:\n\n💰 Valor: ${valor}\n📅 Vencimento: ${vencimento}\n\nAguardamos seu pagamento!`,
        template: {
            name: "cobranca_gerada",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: streaming },
                        { type: "text", text: valor },
                        { type: "text", text: vencimento },
                    ]
                }
            ]
        }
    }),

    cobrancaVencendo: (participante: string, streaming: string, valor: string, dias: number): EnvioWhatsAppObj => ({
        texto: `Lembrete: Sua cobrança de *${streaming}* vence em ${dias} dia(s)! ⏰\n\n💰 Valor: ${valor}\n\nEvite suspensão do serviço realizando o pagamento.`,
        template: {
            name: "cobranca_vencendo",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: streaming },
                        { type: "text", text: String(dias) },
                        { type: "text", text: valor },
                    ]
                }
            ]
        }
    }),

    cobrancaAtrasada: (participante: string, streaming: string, valor: string, diasAtraso: number): EnvioWhatsAppObj => ({
        texto: `⚠️ ${participante}, sua cobrança de *${streaming}* está ${diasAtraso} dia(s) em atraso.\n\n💰 Valor: ${valor}\n\nRealize o pagamento para manter seu acesso ativo.`,
        template: {
            name: "cobranca_atrasada",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: streaming },
                        { type: "text", text: String(diasAtraso) },
                        { type: "text", text: valor },
                    ]
                }
            ]
        }
    }),

    assinaturaSuspensa: (participante: string, streaming: string): EnvioWhatsAppObj => ({
        texto: `❌ ${participante}, sua assinatura de *${streaming}* foi suspensa por falta de pagamento.\n\nRegularize para reativar o acesso.`,
        template: {
            name: "assinatura_suspensa",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: streaming },
                    ]
                }
            ]
        }
    }),

    pagamentoConfirmado: (participante: string, streaming: string, valor: string): EnvioWhatsAppObj => ({
        texto: `✅ ${participante}, pagamento confirmado!\n\n*${streaming}*\n💰 ${valor}\n\nObrigado! Seu acesso continua ativo.`,
        template: {
            name: "pagamento_confirmado",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: streaming },
                        { type: "text", text: valor },
                    ]
                }
            ]
        }
    }),

    loteAprovado: (participante: string, quantidadeItens: string, valorTotal: string): EnvioWhatsAppObj => ({
        texto: `✅ Olá ${participante}, seu lote de pagamento (${quantidadeItens} itens) no valor de ${valorTotal} acaba de ser APROVADO!\n\nTodos os seus acessos estão liberados. Bom entretenimento!`,
        template: {
            name: "lote_aprovado",
            language: "pt_BR",
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: participante },
                        { type: "text", text: quantidadeItens },
                        { type: "text", text: valorTotal },
                    ]
                }
            ]
        }
    }),
};

/**
 * Retorna o ID da configuração se for válida e ativa, senão returna root.
 */
export async function whatsappConfigIsValid(contaId: number): Promise<number | null> {
    const config = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
    });
    return config && config.isAtivo ? config.id : null;
}

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
    mensagemContexto: EnvioWhatsAppObj // Mudado de 'string' para objeto que contém Template
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

    const mensagemTextoLogs = mensagemContexto.texto;
    const templateConfig = mensagemContexto.template;

    // 5. Send (automated uses Meta template API, manual uses wa.me links with pure text)
    const result = await sendWhatsApp(participante.whatsappNumero, mensagemTextoLogs, automated, templateConfig);

    // 6. Log the attempt
    await prisma.whatsAppLog.create({
        data: {
            configId: config.id,
            participanteId,
            tipo,
            numeroDestino: participante.whatsappNumero,
            mensagem: mensagemTextoLogs, // Prisma required string field
            enviado: result.success,
            erro: result.error,
            providerId: result.messageId,
        },
    });

    return result;
}
