import cron from 'node-cron';
import { prisma } from "@/lib/db";
import { sendWhatsAppNotification, whatsappTemplates } from "@/lib/whatsapp-service";
import { addDays, differenceInDays, subHours } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CurrencyCode } from "@/types/currency.types";

/**
 * Verifica cobranças pendentes que estão próximas do vencimento
 * e envia notificações de acordo com a configuração da conta
 */
export async function checkAndNotifyPendingBillings() {
    // Buscar todas contas com WhatsApp ativo e notificação de vencimento habilitada
    const configs = await prisma.whatsAppConfig.findMany({
        where: {
            isAtivo: true,
            notificarCobrancaVencendo: true
        },
    });

    console.log(`[CRON] Encontradas ${configs.length} contas com notificação de vencimento ativa`);

    for (const config of configs) {
        // Data limite = hoje + dias de aviso configurados
        const dataLimite = addDays(new Date(), config.diasAvisoVencimento);

        // Buscar cobranças pendentes que vencem entre hoje e a data limite
        const cobrancas = await prisma.cobranca.findMany({
            where: {
                status: 'pendente',
                periodoFim: {
                    lte: dataLimite,
                    gte: new Date()
                },
                assinatura: {
                    participante: { contaId: config.contaId }
                },
            },
            include: {
                assinatura: {
                    include: {
                        participante: true,
                        streaming: { include: { catalogo: true } }
                    }
                }
            },
        });

        console.log(`[CRON] Conta ${config.contaId}: ${cobrancas.length} cobranças vencendo`);

        for (const cobranca of cobrancas) {
            // Verificar última notificação para evitar spam
            const ultimoLog = await prisma.whatsAppLog.findFirst({
                where: {
                    configId: config.id,
                    participanteId: cobranca.assinatura.participanteId,
                    tipo: 'cobranca_vencendo',
                    createdAt: { gte: subHours(new Date(), 24) }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Se já notificou nas últimas 24h, pular
            if (ultimoLog) {
                console.log(`[CRON] Cobrança ${cobranca.id}: notificação recente, pulando`);
                continue;
            }

            // Calcular dias restantes
            const diasRestantes = differenceInDays(new Date(cobranca.periodoFim), new Date());

            // Fetch account currency
            const conta = await prisma.conta.findUnique({
                where: { id: config.contaId },
                select: { moedaPreferencia: true }
            });

            // Criar mensagem
            const mensagem = whatsappTemplates.cobrancaVencendo(
                cobranca.assinatura.participante.nome,
                cobranca.assinatura.streaming.catalogo.nome,
                formatCurrency(Number(cobranca.valor), (conta?.moedaPreferencia as CurrencyCode) || 'BRL'),
                diasRestantes
            );

            // Enviar notificação
            const result = await sendWhatsAppNotification(
                config.contaId,
                'cobranca_vencendo',
                cobranca.assinatura.participanteId,
                mensagem
            );

            if (result.success) {
                console.log(`[CRON] ✅ Notificação enviada para cobrança ${cobranca.id}`);
            } else if ('reason' in result && result.reason === 'not_configured') {
                // Criar log persistente para notificação pendente
                try {
                    await prisma.whatsAppLog.create({
                        data: {
                            configId: config.id,
                            participanteId: cobranca.assinatura.participanteId,
                            tipo: 'cobranca_vencendo',
                            numeroDestino: cobranca.assinatura.participante.whatsappNumero || '',
                            mensagem,
                            enviado: false,
                            erro: 'Sistema: Notificação pendente - WhatsApp não configurado (CRON)'
                        }
                    });
                    console.log(`[CRON] ℹ️ WhatsApp não configurado - Log criado para cobrança ${cobranca.id}`);
                } catch (logError) {
                    console.error(`[CRON] Erro ao criar log para cobrança ${cobranca.id}:`, logError);
                }
            } else {
                console.log(`[CRON] ❌ Falha ao enviar notificação para cobrança ${cobranca.id}: ${JSON.stringify(result)}`);
            }
        }
    }
}

/**
 * Verifica cobranças atrasadas e envia notificações
 */
export async function checkAndNotifyOverdueBillings() {
    // Buscar todas contas com WhatsApp ativo e notificação de atraso habilitada
    const configs = await prisma.whatsAppConfig.findMany({
        where: {
            isAtivo: true,
            notificarCobrancaAtrasada: true
        },
    });

    console.log(`[CRON] Encontradas ${configs.length} contas com notificação de atraso ativa`);

    for (const config of configs) {
        // Buscar cobranças atrasadas
        const cobrancas = await prisma.cobranca.findMany({
            where: {
                status: 'atrasado',
                assinatura: {
                    participante: { contaId: config.contaId }
                },
            },
            include: {
                assinatura: {
                    include: {
                        participante: true,
                        streaming: { include: { catalogo: true } }
                    }
                }
            },
        });

        console.log(`[CRON] Conta ${config.contaId}: ${cobrancas.length} cobranças atrasadas`);

        for (const cobranca of cobrancas) {
            // Verificar última notificação para evitar spam
            const ultimoLog = await prisma.whatsAppLog.findFirst({
                where: {
                    configId: config.id,
                    participanteId: cobranca.assinatura.participanteId,
                    tipo: 'cobranca_atrasada',
                    createdAt: { gte: subHours(new Date(), 24) }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Se já notificou nas últimas 24h, pular
            if (ultimoLog) {
                console.log(`[CRON] Cobrança ${cobranca.id}: notificação de atraso recente, pulando`);
                continue;
            }

            // Calcular dias de atraso
            const diasAtraso = differenceInDays(new Date(), new Date(cobranca.periodoFim));

            // Fetch account currency
            const conta = await prisma.conta.findUnique({
                where: { id: config.contaId },
                select: { moedaPreferencia: true }
            });

            // Criar mensagem
            const mensagem = whatsappTemplates.cobrancaAtrasada(
                cobranca.assinatura.participante.nome,
                cobranca.assinatura.streaming.catalogo.nome,
                formatCurrency(Number(cobranca.valor), (conta?.moedaPreferencia as CurrencyCode) || 'BRL'),
                diasAtraso
            );

            // Enviar notificação
            const result = await sendWhatsAppNotification(
                config.contaId,
                'cobranca_atrasada',
                cobranca.assinatura.participanteId,
                mensagem
            );

            if (result.success) {
                console.log(`[CRON] ✅ Notificação de atraso enviada para cobrança ${cobranca.id}`);
            } else if ('reason' in result && result.reason === 'not_configured') {
                // Criar log persistente para notificação de atraso pendente
                try {
                    await prisma.whatsAppLog.create({
                        data: {
                            configId: config.id,
                            participanteId: cobranca.assinatura.participanteId,
                            tipo: 'cobranca_atrasada',
                            numeroDestino: cobranca.assinatura.participante.whatsappNumero || '',
                            mensagem,
                            enviado: false,
                            erro: 'Sistema: Notificação de atraso pendente - WhatsApp não configurado (CRON)'
                        }
                    });
                    console.log(`[CRON] ℹ️ WhatsApp não configurado - Log de atraso criado para cobrança ${cobranca.id}`);
                } catch (logError) {
                    console.error(`[CRON] Erro ao criar log de atraso para cobrança ${cobranca.id}:`, logError);
                }
            } else {
                console.log(`[CRON] ❌ Falha ao enviar notificação de atraso para cobrança ${cobranca.id}: ${JSON.stringify(result)}`);
            }
        }
    }
}
