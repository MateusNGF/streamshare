"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

import { StatusCobranca } from "@prisma/client";
import { criarNotificacao } from "@/actions/notificacoes";
import {
    calcularProximoVencimento,
    calcularValorPeriodo,
    estaAtrasado
} from "@/lib/financeiro-utils";
import type { EnviarNotificacaoResult } from "@/types/whatsapp";
import type { CurrencyCode } from "@/types/currency.types";

import { getContext } from "@/lib/action-context";

/**
 * Get all charges for the current account with optional filters
 */
export async function getCobrancas(filters?: {
    status?: StatusCobranca;
    participanteId?: number;
    mes?: number;
    ano?: number;
}) {
    const { contaId } = await getContext();

    const where: any = {
        assinatura: {
            participante: { contaId }
        }
    };

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.participanteId) {
        where.assinatura = {
            ...where.assinatura,
            participanteId: filters.participanteId
        };
    }

    if (filters?.mes && filters?.ano) {
        const startDate = new Date(filters.ano, filters.mes - 1, 1);
        const endDate = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
        where.periodoFim = { gte: startDate, lte: endDate };
    }

    const cobrancas = await prisma.cobranca.findMany({
        where,
        include: {
            assinatura: {
                include: {
                    participante: true,
                    streaming: {
                        include: { catalogo: true }
                    }
                }
            }
        },
        orderBy: { periodoFim: "desc" }
    });

    return cobrancas;
}

/**
 * Create initial charge when subscription is created
 */
export async function criarCobrancaInicial(assinaturaId: number) {
    await getContext(); // Validate auth

    const assinatura = await prisma.assinatura.findUnique({
        where: { id: assinaturaId }
    });

    if (!assinatura) {
        throw new Error("Assinatura não encontrada");
    }

    const periodoInicio = assinatura.dataInicio;

    // Check for existing charge (Idempotency)
    const existing = await prisma.cobranca.findFirst({
        where: {
            assinaturaId,
            periodoInicio
        }
    });

    if (existing) {
        return existing;
    }

    const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
    const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

    const cobranca = await prisma.cobranca.create({
        data: {
            assinaturaId,
            valor,
            periodoInicio,
            periodoFim,
            status: assinatura.cobrancaAutomaticaPaga ? "pago" : "pendente",
            dataPagamento: assinatura.cobrancaAutomaticaPaga ? new Date() : null
        }
    });

    revalidatePath("/cobrancas");
    return cobranca;
}

/**
 * Confirm payment for a charge
 */
export async function confirmarPagamento(
    cobrancaId: number,
    comprovanteUrl?: string
) {
    const { contaId, userId } = await getContext();

    // Verify ownership
    const cobranca = await prisma.cobranca.findFirst({
        where: {
            id: cobrancaId,
            assinatura: {
                participante: { contaId }
            }
        }
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.status === StatusCobranca.pago) {
        throw new Error("Cobrança já foi confirmada");
    }

    const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.cobranca.update({
            where: { id: cobrancaId },
            data: {
                status: StatusCobranca.pago,
                dataPagamento: new Date(),
                comprovanteUrl
            },
            include: {
                assinatura: {
                    include: {
                        participante: true,
                        streaming: true
                    }
                }
            }
        });

        const agora = new Date();
        const assinatura = result.assinatura;

        // Check for reactivation (D-07)
        // Criteria: Suspended AND charge covers the current date
        const isSuspended = assinatura.status === "suspensa";
        const coversCurrentDate = agora >= result.periodoInicio && agora <= result.periodoFim;

        if (isSuspended && coversCurrentDate) {
            await tx.assinatura.update({
                where: { id: assinatura.id },
                data: {
                    status: "ativa",
                    dataSuspensao: null,
                    motivoSuspensao: null
                }
            });

            // Re-activation notification
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: userId,
                    tipo: "assinatura_editada",
                    titulo: "Assinatura Reativada",
                    descricao: `A assinatura de ${assinatura.participante.nome} foi reativada automaticamente após o pagamento da cobrança atual.`,
                    entidadeId: assinatura.id,
                }
            });
        }

        // Create notification inside transaction for the payment itself
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: userId,
                tipo: "cobranca_confirmada",
                titulo: `Pagamento confirmado`,
                descricao: `Pagamento de ${result.assinatura.participante.nome} no valor de ${result.valor} foi confirmado.`,
                entidadeId: cobrancaId,
                lida: false
            }
        });

        return result;
    });

    revalidatePath("/cobrancas");
    return updated;
}

/**
 * Cancel a charge
 */
export async function cancelarCobranca(cobrancaId: number) {
    const { contaId, userId } = await getContext();

    // Verify ownership
    const cobranca = await prisma.cobranca.findFirst({
        where: {
            id: cobrancaId,
            assinatura: {
                participante: { contaId }
            }
        }
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.status === StatusCobranca.pago) {
        throw new Error("Não é possível cancelar uma cobrança já paga");
    }

    const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.cobranca.update({
            where: { id: cobrancaId },
            data: {
                status: StatusCobranca.cancelado
            },
            include: {
                assinatura: {
                    include: {
                        participante: true
                    }
                }
            }
        });

        // Create notification inside transaction
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: userId,
                tipo: "cobranca_cancelada",
                titulo: `Cobrança cancelada`,
                descricao: `Cobrança de ${result.assinatura.participante.nome} foi cancelada.`,
                entidadeId: cobrancaId,
                lida: false
            }
        });

        return result;
    });

    revalidatePath("/cobrancas");
    return updated;
}

/**
 * Get financial KPIs for dashboard
 */
export async function getKPIsFinanceiros() {
    const { contaId } = await getContext();
    const agora = new Date();

    // 1. Group by status to get counts and sums
    const statsByStatus = await prisma.cobranca.groupBy({
        by: ["status"],
        where: {
            assinatura: {
                participante: { contaId }
            }
        },
        _sum: {
            valor: true
        },
        _count: {
            _all: true
        }
    });

    // 2. Specialized aggregate for "em atraso" (pendente/atrasado and expired)
    const overdueStats = await prisma.cobranca.aggregate({
        where: {
            assinatura: {
                participante: { contaId }
            },
            status: { in: [StatusCobranca.pendente, StatusCobranca.atrasado] },
            periodoFim: { lt: agora }
        },
        _sum: {
            valor: true
        }
    });

    // Map results
    const statusMap = statsByStatus.reduce((acc, curr) => {
        acc[curr.status] = {
            sum: curr._sum.valor?.toNumber() || 0,
            count: curr._count._all
        };
        return acc;
    }, {} as Record<StatusCobranca, { sum: number, count: number }>);

    const receitaConfirmada = statusMap[StatusCobranca.pago]?.sum || 0;
    const totalPendente = statusMap[StatusCobranca.pendente]?.sum || 0;
    const emAtraso = overdueStats._sum.valor?.toNumber() || 0;
    const totalCobrancas = statsByStatus.reduce((sum, curr) => sum + curr._count._all, 0);

    return {
        totalPendente,
        receitaConfirmada,
        emAtraso,
        totalCobrancas
    };
}

/**
 * Renew charges for active subscriptions (CRON job or manual trigger)
 */
export async function renovarCobrancas() {
    const { contaId } = await getContext();
    const { billingService } = await import("@/services/billing-service");

    const result = await billingService.processarRenovacoes(contaId);

    revalidatePath("/cobrancas");

    return result;
}

/**
 * Enviar notificação WhatsApp manual para uma cobrança
 * A mensagem é determinada automaticamente baseada no status da cobrança
 * @param cobrancaId - ID da cobrança
 * @returns Resultado com sucesso e link manual se aplicável
 */
export async function enviarNotificacaoCobranca(
    cobrancaId: number
): Promise<EnviarNotificacaoResult> {
    const { contaId } = await getContext();

    // Buscar cobrança com todos os relacionamentos necessários
    const cobranca = await prisma.cobranca.findUnique({
        where: { id: cobrancaId },
        include: {
            assinatura: {
                include: {
                    participante: true,
                    streaming: { include: { catalogo: true } },
                },
            },
        },
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.assinatura.participante.contaId !== contaId) {
        throw new Error("Sem permissão para acessar esta cobrança");
    }

    // Verificar se participante tem WhatsApp
    if (!cobranca.assinatura.participante.whatsappNumero) {
        throw new Error("Participante não possui número de WhatsApp cadastrado");
    }

    // Buscar configuração do WhatsApp
    const whatsappConfig = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
        select: { id: true, isAtivo: true }
    });

    // Importar serviço WhatsApp
    const { sendWhatsAppNotification, whatsappTemplates } = await import("@/lib/whatsapp-service");
    const { TipoNotificacaoWhatsApp } = await import("@prisma/client");
    const { differenceInDays } = await import("date-fns");

    // Determinar tipo de notificação e mensagem baseado no status
    let tipo: typeof TipoNotificacaoWhatsApp[keyof typeof TipoNotificacaoWhatsApp];
    let mensagem: string;

    const participante = cobranca.assinatura.participante.nome;
    const streaming = cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome;

    // Fetch user's currency preference
    const conta = await prisma.conta.findUnique({
        where: { id: cobranca.assinatura.participante.contaId },
        select: { moedaPreferencia: true }
    });

    const { formatCurrency } = await import("@/lib/formatCurrency");
    const valor = formatCurrency(cobranca.valor.toNumber(), (conta?.moedaPreferencia as CurrencyCode) || 'BRL');

    switch (cobranca.status) {
        case 'pendente': {
            const diasRestantes = differenceInDays(new Date(cobranca.periodoFim), new Date());
            tipo = 'cobranca_vencendo' as any;
            mensagem = whatsappTemplates.cobrancaVencendo(participante, streaming, valor, diasRestantes);
            break;
        }

        case 'atrasado': {
            const diasAtraso = differenceInDays(new Date(), new Date(cobranca.periodoFim));
            tipo = 'cobranca_atrasada' as any;
            mensagem = whatsappTemplates.cobrancaAtrasada(participante, streaming, valor, diasAtraso);
            break;
        }

        case 'pago': {
            tipo = 'pagamento_confirmado' as any;
            mensagem = whatsappTemplates.pagamentoConfirmado(participante, streaming, valor);
            break;
        }

        default:
            throw new Error("Status da cobrança não permite envio de notificação");
    }

    // **SE NÃO CONFIGURADO: Retornar link wa.me para envio manual**
    if (!whatsappConfig || !whatsappConfig.isAtivo) {
        try {
            const { generateWhatsAppLink } = await import("@/lib/whatsapp-link-utils");
            const link = generateWhatsAppLink(
                cobranca.assinatura.participante.whatsappNumero,
                mensagem
            );

            // Criar log de tentativa manual (não bloqueia se falhar)
            try {
                if (whatsappConfig?.id) {
                    await prisma.whatsAppLog.create({
                        data: {
                            configId: whatsappConfig.id,
                            participanteId: cobranca.assinatura.participanteId,
                            tipo,
                            numeroDestino: cobranca.assinatura.participante.whatsappNumero,
                            mensagem,
                            enviado: false,
                            erro: "Envio manual via wa.me - WhatsApp não configurado"
                        }
                    });
                }
            } catch (logError) {
                console.error('[WhatsApp] Falha ao criar log de envio manual:', logError);
                // Não bloqueia o fluxo - log é secundário
            }

            return {
                success: true,
                manualLink: link,
                message: "Abra o link para enviar manualmente pelo WhatsApp"
            };
        } catch (linkError) {
            throw new Error(
                `Erro ao gerar link WhatsApp: ${(linkError as Error).message}`
            );
        }
    }

    // **VERIFICAR LOGS RECENTES (Anti-spam)**
    const { subHours, formatDistanceToNow } = await import("date-fns");
    const { ptBR } = await import("date-fns/locale");

    const ultimoLog = await prisma.whatsAppLog.findFirst({
        where: {
            configId: whatsappConfig.id,
            participanteId: cobranca.assinatura.participanteId,
            createdAt: { gte: subHours(new Date(), 24) },
            enviado: true
        },
        orderBy: { createdAt: 'desc' }
    });

    if (ultimoLog) {
        const tempoDecorrido = formatDistanceToNow(new Date(ultimoLog.createdAt), {
            addSuffix: true,
            locale: ptBR
        });
        throw new Error(`Já foi enviada uma notificação WhatsApp ${tempoDecorrido}. Aguarde 24 horas para enviar novamente.`);
    }

    // **SE CONFIGURADO: Enviar via Twilio API**
    const result = await sendWhatsAppNotification(
        contaId,
        tipo,
        cobranca.assinatura.participanteId,
        mensagem
    );

    if (!result.success) {
        const errorMsg = ('error' in result ? result.error : undefined) || ('reason' in result ? result.reason : undefined) || "Erro ao enviar notificação";
        throw new Error(errorMsg);
    }

    revalidatePath("/cobrancas");
    return { success: true };
}
