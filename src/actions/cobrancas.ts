"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

import { StatusCobranca } from "@prisma/client";
import {
    calcularProximoVencimento,
    calcularValorPeriodo, calcularDataVencimentoPadrao
} from "@/lib/financeiro-utils";
import type { EnviarNotificacaoResult } from "@/types/whatsapp";
import type { CurrencyCode } from "@/types/currency.types";

import { getContext } from "@/lib/action-context";
import { billingService } from "@/services/billing-service";

/**
 * Get all charges for the current account with optional filters
 */
export async function getCobrancas(filters?: {
    status?: StatusCobranca;
    participanteId?: number;
    mes?: number;
    ano?: number;
    valorMin?: number;
    valorMax?: number;
    hasWhatsapp?: boolean;
}) {
    try {
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

        if (filters?.valorMin !== undefined || filters?.valorMax !== undefined) {
            where.valor = {};
            if (filters.valorMin !== undefined) where.valor.gte = filters.valorMin;
            if (filters.valorMax !== undefined) where.valor.lte = filters.valorMax;
        }

        if (filters?.hasWhatsapp !== undefined) {
            where.assinatura = {
                ...where.assinatura,
                participante: {
                    ...where.assinatura?.participante,
                    whatsappNumero: filters.hasWhatsapp ? { not: null } : null
                }
            };
        }

        const cobrancas = await prisma.cobranca.findMany({
            where,
            include: {
                assinatura: {
                    include: {
                        participante: {
                            include: {
                                conta: {
                                    select: {
                                        id: true,
                                        nome: true,
                                        chavePix: true,
                                    }
                                }
                            }
                        },
                        streaming: {
                            include: { catalogo: true }
                        }
                    }
                }
            },
            orderBy: { dataVencimento: "desc" }
        });

        return { success: true, data: cobrancas };
    } catch (error: any) {
        console.error("[GET_COBRANCAS_ERROR]", error);
        return { success: false, error: "Erro ao buscar cobranças" };
    }
}

/**
 * Create initial charge when subscription is created
 */
export async function criarCobrancaInicial(assinaturaId: number) {
    try {
        await getContext(); // Validate auth

        const assinatura = await prisma.assinatura.findUnique({
            where: { id: assinaturaId }
        });

        if (!assinatura) {
            return { success: false, error: "Assinatura não encontrada" };
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
            return { success: true, data: existing };
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
                dataPagamento: assinatura.cobrancaAutomaticaPaga ? new Date() : null,
                dataVencimento: calcularDataVencimentoPadrao()
            }
        });

        revalidatePath("/cobrancas");
        return { success: true, data: cobranca };
    } catch (error: any) {
        console.error("[CRIAR_COBRANCA_INICIAL_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar cobrança inicial" };
    }
}

/**
 * Confirm payment for a charge
 */
export async function confirmarPagamento(
    cobrancaId: number,
    formData?: FormData
) {
    try {
        const { contaId, userId } = await getContext();

        let comprovanteUrl: string | undefined = undefined;

        // Se houver formData, tenta extrair e fazer upload do comprovante
        if (formData) {
            const file = formData.get("comprovante") as File;
            if (file && file instanceof Blob && file.size > 0) {
                const { uploadComprovante } = await import("@/lib/storage");
                try {
                    comprovanteUrl = await uploadComprovante(file, `manual_confirmation_${cobrancaId}_${Date.now()}`);
                } catch (err) {
                    console.error("[UPLOAD_MANUAL_ERROR]", err);
                    // Não bloqueamos a confirmação se o upload do comprovante falhar, 
                    // a menos que desejemos que seja obrigatório. 
                    // Por enquanto, vamos apenas avisar no log.
                }
            }
        }

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
            return { success: false, error: "Cobrança não encontrada" };
        }

        if (cobranca.status === StatusCobranca.pago) {
            return { success: false, error: "Cobrança já foi confirmada" };
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
                            streaming: { include: { catalogo: true } }
                        }
                    }
                }
            });

            const agora = new Date();
            const assinatura = result.assinatura;

            // Check for activation/reactivation (D-07)
            await billingService.avaliarAtivacaoAposPagamento(tx, {
                assinatura: result.assinatura,
                cobranca: result,
                contaId,
                agora
            });

            // Create notification inside transaction for the payment itself (Broadcast to Admins)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "cobranca_confirmada",
                    titulo: `Pagamento confirmado`,
                    descricao: `Pagamento de ${result.assinatura.participante.nome} no valor de ${result.valor} foi confirmado.`,
                    entidadeId: cobrancaId,
                    lida: false
                }
            });

            // Notificar o participante que seu pagamento foi confirmado
            if (result.assinatura.participante.userId) {
                await tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: result.assinatura.participante.userId,
                        tipo: "cobranca_confirmada",
                        titulo: "Pagamento Aprovado",
                        descricao: `O administrador confirmou o seu pagamento para ${result.assinatura.streaming.catalogo.nome}. Obrigado!`,
                        entidadeId: cobrancaId,
                        lida: false
                    }
                });
            }

            return result;
        });

        revalidatePath("/cobrancas");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("[CONFIRMAR_PAGAMENTO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao confirmar pagamento" };
    }
}

/**
 * Cancel a charge
 */
export async function cancelarCobranca(cobrancaId: number) {
    try {
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
            return { success: false, error: "Cobrança não encontrada" };
        }

        if (cobranca.status === StatusCobranca.pago) {
            return { success: false, error: "Não é possível cancelar uma cobrança já paga" };
        }

        const updated = await prisma.$transaction(async (tx) => {
            const result = await tx.cobranca.update({
                where: { id: cobrancaId },
                data: {
                    status: StatusCobranca.cancelado,
                    deletedAt: new Date()
                },
                include: {
                    assinatura: {
                        include: {
                            participante: true,
                            streaming: { include: { catalogo: true } }
                        }
                    }
                }
            });

            // Create notification inside transaction (Broadcast to Admins)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "cobranca_cancelada",
                    titulo: `Cobrança cancelada`,
                    descricao: `Cobrança de ${result.assinatura.participante.nome} foi cancelada.`,
                    entidadeId: cobrancaId,
                    lida: false
                }
            });

            // Notificar o participante do cancelamento da cobrança
            if (result.assinatura.participante.userId) {
                await tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: result.assinatura.participante.userId,
                        tipo: "cobranca_cancelada",
                        titulo: "Cobrança Cancelada",
                        descricao: `A cobrança para o seu acesso de ${result.assinatura.streaming.catalogo.nome} foi cancelada pelo administrador.`,
                        entidadeId: cobrancaId,
                        lida: false
                    }
                });
            }

            return result;
        });

        revalidatePath("/cobrancas");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("[CANCELAR_COBRANCA_ERROR]", error);
        return { success: false, error: error.message || "Erro ao cancelar cobrança" };
    }
}

/**
 * Get financial KPIs for dashboard
 */
export async function getKPIsFinanceiros() {
    try {
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
                dataVencimento: { lt: agora }
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
            success: true,
            data: {
                totalPendente,
                receitaConfirmada,
                emAtraso,
                totalCobrancas
            }
        };
    } catch (error: any) {
        console.error("[GET_KPIS_FINANCEIROS_ERROR]", error);
        return { success: false, error: "Erro ao buscar KPIs financeiros" };
    }
}

/**
 * Renew charges for active subscriptions (CRON job or manual trigger)
 */
export async function renovarCobrancas() {
    try {
        const { contaId } = await getContext();
        const { billingService } = await import("@/services/billing-service");

        const result = await billingService.processarRenovacoes(contaId);

        revalidatePath("/cobrancas");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[RENOVAR_COBRANCAS_ERROR]", error);
        return { success: false, error: "Erro ao renovar cobranças" };
    }
}

/**
 * Enviar notificação WhatsApp manual para uma cobrança
 * A mensagem é determinada automaticamente baseada no status da cobrança
 * @param cobrancaId - ID da cobrança
 * @returns Resultado com sucesso e link manual se aplicável
 */
export async function enviarNotificacaoCobranca(
    cobrancaId: number
): Promise<any> {
    try {
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
            return { success: false, error: "Cobrança não encontrada" };
        }

        if (cobranca.assinatura.participante.contaId !== contaId) {
            return { success: false, error: "Sem permissão para acessar esta cobrança" };
        }

        // Verificar se participante tem WhatsApp
        if (!cobranca.assinatura.participante.whatsappNumero) {
            return { success: false, error: "Participante não possui número de WhatsApp cadastrado" };
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
                const diasRestantes = differenceInDays(cobranca.dataVencimento, new Date());
                tipo = 'cobranca_vencendo' as any;
                mensagem = whatsappTemplates.cobrancaVencendo(participante, streaming, valor, diasRestantes);
                break;
            }

            case 'atrasado': {
                const diasAtraso = differenceInDays(new Date(), cobranca.dataVencimento);
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
                return { success: false, error: "Status da cobrança não permite envio de notificação" };
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
                    data: {
                        manualLink: link,
                        message: "Abra o link para enviar manualmente pelo WhatsApp"
                    }
                };
            } catch (linkError: any) {
                return { success: false, error: `Erro ao gerar link WhatsApp: ${linkError.message}` };
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
            return { success: false, error: `Já foi enviada uma notificação WhatsApp ${tempoDecorrido}. Aguarde 24 horas para enviar novamente.` };
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
            return { success: false, error: errorMsg };
        }

        revalidatePath("/cobrancas");
        return { success: true };
    } catch (error: any) {
        console.error("[ENVIAR_NOTIFICACAO_COBRANCA_ERROR]", error);
        return { success: false, error: error.message || "Erro ao enviar notificação" };
    }
}
