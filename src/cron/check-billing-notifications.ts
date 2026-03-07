import { prisma } from "@/lib/db";
import { TipoNotificacaoWhatsApp } from "@prisma/client";
import { sendWhatsAppNotification, whatsappTemplates } from "@/lib/whatsapp-service";
import { addDays, differenceInDays, subHours } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CurrencyCode } from "@/types/currency.types";

import { EnvioWhatsAppObj } from "@/lib/whatsapp-service";

type NotificationType = TipoNotificacaoWhatsApp;

/**
 * Interface para os parâmetros de processamento de notificações
 */
interface ProcessNotificationParams {
    tipo: NotificationType;
    configFilter: {
        notificarCobrancaVencendo?: boolean;
        notificarCobrancaAtrasada?: boolean;
    };
    getBillingFilter: (config: any) => any;
    getMensagem: (cobranca: any, moeda: CurrencyCode) => EnvioWhatsAppObj;
    logPrefix: string;
}

/**
 * Função genérica para processar grupos de notificações de cobrança
 * Segue o princípio DRY (Don't Repeat Yourself) e SRP (Single Responsibility Principle)
 */
async function processBillingNotifications({
    tipo,
    configFilter,
    getBillingFilter,
    getMensagem,
    logPrefix
}: ProcessNotificationParams) {
    // Buscar todas contas com WhatsApp ativo e a flag específica habilitada
    // Incluir a Conta para pegar a moeda de preferência (evita N+1)
    const configs = await prisma.whatsAppConfig.findMany({
        where: {
            isAtivo: true,
            ...configFilter
        },
        include: {
            conta: {
                select: { moedaPreferencia: true }
            }
        }
    });

    console.log(`[${logPrefix}] Encontradas ${configs.length} contas configuradas`);

    for (const config of configs) {
        // Buscar cobranças de acordo com o filtro específico
        const cobrancas = await prisma.cobranca.findMany({
            where: getBillingFilter(config),
            include: {
                assinatura: {
                    include: {
                        participante: true,
                        streaming: { include: { catalogo: true } }
                    }
                }
            },
        });

        if (cobrancas.length === 0) continue;

        console.log(`[${logPrefix}] Conta ${config.contaId}: ${cobrancas.length} cobranças para processar`);

        const moeda = (config.conta.moedaPreferencia as CurrencyCode) || 'BRL';

        for (const cobranca of cobrancas) {
            const participanteId = cobranca.assinatura.participanteId;

            // Verificar última notificação deste tipo para este participante nas últimas 24h (Antispam)
            const ultimoLog = await prisma.whatsAppLog.findFirst({
                where: {
                    configId: config.id,
                    participanteId,
                    tipo,
                    createdAt: { gte: subHours(new Date(), 24) }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (ultimoLog) {
                console.log(`[${logPrefix}] Cobrança ${cobranca.id}: notificação recente enviada, pulando`);
                continue;
            }

            const mensagem = getMensagem(cobranca, moeda);
            const mensagemTextoLogs = mensagem.texto;

            // Tentar enviar notificação
            const result = await sendWhatsAppNotification(
                config.contaId,
                tipo,
                participanteId,
                mensagem
            );

            if (result.success) {
                console.log(`[${logPrefix}] ✅ Notificação enviada para cobrança ${cobranca.id}`);
            } else if (result.error === 'account_disabled') {
                // Registrar log persistente caso o WhatsApp não esteja configurado no momento
                try {
                    await prisma.whatsAppLog.create({
                        data: {
                            configId: config.id,
                            participanteId,
                            tipo,
                            numeroDestino: cobranca.assinatura.participante.whatsappNumero || '',
                            mensagem: mensagemTextoLogs,
                            enviado: false,
                            erro: `Sistema: Notificação pendente - WhatsApp não configurado (${logPrefix})`
                        }
                    });
                    console.log(`[${logPrefix}] ℹ️ WhatsApp não configurado - Log de atraso criado para cobrança ${cobranca.id}`);
                } catch (logError) {
                    console.error(`[${logPrefix}] Erro ao criar log para cobrança ${cobranca.id}:`, logError);
                }
            } else {
                console.log(`[${logPrefix}] ❌ Falha ao enviar notificação para cobrança ${cobranca.id}: ${JSON.stringify(result)}`);
            }
        }
    }
}

/**
 * Verifica cobranças pendentes que estão próximas do vencimento
 */
export async function checkAndNotifyPendingBillings() {
    return processBillingNotifications({
        tipo: 'cobranca_vencendo',
        configFilter: { notificarCobrancaVencendo: true },
        logPrefix: 'CRON_VENCENDO',
        getBillingFilter: (config) => ({
            status: 'pendente',
            lotePagamentoId: null,
            periodoFim: {
                lte: addDays(new Date(), config.diasAvisoVencimento),
                gte: new Date()
            },
            assinatura: {
                participante: { contaId: config.contaId }
            }
        }),
        getMensagem: (cobranca, moeda) => {
            const diasRestantes = differenceInDays(new Date(cobranca.periodoFim), new Date());
            return whatsappTemplates.cobrancaVencendo(
                cobranca.assinatura.participante.nome,
                cobranca.assinatura.streaming.catalogo.nome,
                formatCurrency(Number(cobranca.valor), moeda),
                diasRestantes
            );
        }
    });
}

/**
 * Verifica cobranças atrasadas e envia notificações
 */
export async function checkAndNotifyOverdueBillings() {
    return processBillingNotifications({
        tipo: 'cobranca_atrasada',
        configFilter: { notificarCobrancaAtrasada: true },
        logPrefix: 'CRON_ATRASO',
        getBillingFilter: (config) => ({
            status: 'atrasado',
            lotePagamentoId: null,
            assinatura: {
                participante: { contaId: config.contaId }
            }
        }),
        getMensagem: (cobranca, moeda) => {
            const diasAtraso = differenceInDays(new Date(), new Date(cobranca.periodoFim));
            return whatsappTemplates.cobrancaAtrasada(
                cobranca.assinatura.participante.nome,
                cobranca.assinatura.streaming.catalogo.nome,
                formatCurrency(Number(cobranca.valor), moeda),
                diasAtraso
            );
        }
    });
}

/**
 * Verifica Lotes pendentes (Faturas Consolidadas) e envia notificação unificada.
 */
export async function checkAndNotifyConsolidatedBillings() {
    const configs = await prisma.whatsAppConfig.findMany({
        where: { isAtivo: true, notificarCobrancaGerada: true },
        include: { conta: { select: { moedaPreferencia: true } } }
    });

    for (const config of configs) {
        // Encontra lotes pendentes que ainda não foram notificados nas últimas 24h
        const lotes = await prisma.lotePagamento.findMany({
            where: {
                status: 'pendente',
                contaId: config.contaId,
            },
            include: {
                participante: true,
                cobrancas: {
                    include: {
                        assinatura: { include: { streaming: { include: { catalogo: true } } } }
                    }
                }
            }
        });

        const moeda = (config.conta.moedaPreferencia as CurrencyCode) || 'BRL';

        for (const lote of lotes) {
            if (lote.cobrancas.length === 0) continue;

            const participanteId = lote.participanteId;
            const logType = 'cobranca_gerada' as TipoNotificacaoWhatsApp;

            // Evitar spam: checar se já mandou notificação de cobrança gerada para ESTE lote.
            const ultimoLog = await prisma.whatsAppLog.findFirst({
                where: {
                    configId: config.id,
                    participanteId,
                    tipo: logType,
                    mensagem: { contains: "Sua fatura consolidada StreamShare" },
                    createdAt: { gte: subHours(new Date(), 24 * 7) } // Uma vez por período para faturas
                }
            });

            if (ultimoLog) continue;

            const servicosNames = lote.cobrancas.map(c => c.assinatura.streaming.catalogo.nome).join(', ');

            const mensagem = whatsappTemplates.faturaConsolidada(
                lote.participante.nome,
                servicosNames,
                formatCurrency(lote.valorTotal.toNumber(), moeda),
                lote.expiresAt ? new Date(lote.expiresAt).toLocaleDateString('pt-BR') : 'N/D'
            );

            const result = await sendWhatsAppNotification(
                config.contaId,
                logType,
                participanteId,
                mensagem
            );

            if (result.success) {
                console.log(`[CRON_LOTE] ✅ Fatura consolidada notificada para ${lote.participante.nome}`);
            }
        }
    }
}

