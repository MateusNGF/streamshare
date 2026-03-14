"use server";

import { startOfMonth, endOfMonth, subMonths, format, startOfToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { FilterService } from "@/services/filter.service";

import { StatusCobranca, StatusLote, Prisma, NivelAcesso } from "@prisma/client";
import {
    calcularProximoVencimento,
    calcularValorPeriodo, calcularDataVencimentoPadrao
} from "@/lib/financeiro-utils";
import type { EnviarNotificacaoResult } from "@/types/whatsapp";
import type { CurrencyCode } from "@/types/currency.types";

import { getContext } from "@/lib/action-context";
import { billingService } from "@/services/billing-service";
import { uploadComprovante } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { LotePagamentoService } from "@/services/lote-pagamento.service";

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
        const where = FilterService.buildCobrancaWhere(contaId, filters);

        const cobrancas = await prisma.cobranca.findMany({
            where,
            select: {
                id: true,
                status: true,
                valor: true,
                dataVencimento: true,
                periodoInicio: true,
                periodoFim: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                dataPagamento: true,
                comprovanteUrl: true,
                dataEnvioComprovante: true,
                gatewayTransactionId: true,
                gatewayProvider: true,
                tentativas: true,
                metadataJson: true,
                lotePagamentoId: true,
                assinaturaId: true,
                assinatura: {
                    select: {
                        id: true,
                        participanteId: true,
                        streamingId: true,
                        frequencia: true,
                        valor: true,
                        participante: {
                            select: {
                                id: true,
                                nome: true,
                                whatsappNumero: true,
                                contaId: true
                            }
                        },
                        streaming: {
                            select: {
                                id: true,
                                apelido: true,
                                catalogo: {
                                    select: {
                                        nome: true,
                                        iconeUrl: true,
                                        corPrimaria: true
                                    }
                                }
                            }
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
    data?: FormData | string
) {
    try {
        const { contaId, userId } = await getContext();

        let comprovanteUrl: string | undefined = undefined;

        // Se houver dados extras (FormData ou String de URL)
        if (data) {
            if (typeof data === "string") {
                comprovanteUrl = data;
            } else if (data instanceof FormData) {
                const file = data.get("comprovante") as File;
                if (file && file instanceof Blob && file.size > 0) {
                    const { uploadComprovante } = await import("@/lib/storage");
                    try {
                        comprovanteUrl = await uploadComprovante(file, `manual_confirmation_${cobrancaId}_${Date.now()}`);
                    } catch (err) {
                        console.error("[UPLOAD_MANUAL_ERROR]", err);
                    }
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
 * Rejects a charge, reverting it to pendente and clearing comprovante
 */
export async function rejeitarCobrancaAction(cobrancaId: number, motivo?: string) {
    try {
        const { contaId } = await getContext();

        const cobranca = await prisma.cobranca.findFirst({
            where: {
                id: cobrancaId,
                status: "aguardando_aprovacao",
                assinatura: {
                    participante: { contaId }
                }
            },
            include: {
                assinatura: {
                    include: {
                        participante: { include: { usuario: true } },
                        streaming: { include: { catalogo: true } }
                    }
                }
            }
        });

        if (!cobranca) {
            return { success: false, error: "Cobrança não encontrada ou não está aguardando aprovação" };
        }

        const txResult = await prisma.$transaction(async (tx) => {
            const updated = await tx.cobranca.update({
                where: { id: cobrancaId },
                data: {
                    status: "pendente",
                    comprovanteUrl: null // Limpa o comprovante para reenvio
                }
            });

            // Notifica o participante
            if (cobranca.assinatura.participante.userId) {
                await tx.notificacao.create({
                    data: {
                        contaId,
                        usuarioId: cobranca.assinatura.participante.userId,
                        tipo: "cobranca_cancelada",
                        titulo: "Pagamento Rejeitado",
                        descricao: `O comprovante da fatura #${cobrancaId} foi rejeitado. Motivo: ${motivo || 'inválido'}. Por favor, reenvie.`,
                        entidadeId: cobrancaId,
                        lida: false
                    }
                });
            }

            return updated;
        });

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        return { success: true, data: txResult };
    } catch (error: any) {
        console.error("[REJEITAR_COBRANCA_ERROR]", error);
        return { success: false, error: "Erro ao rejeitar cobrança" };
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
        const emAtraso = statusMap[StatusCobranca.atrasado]?.sum || 0;
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
        let mensagem: any;

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

        const mensagemTexto = typeof mensagem === "string" ? mensagem : mensagem?.texto;

        // **SE NÃO CONFIGURADO: Retornar link wa.me para envio manual**
        if (!whatsappConfig || !whatsappConfig.isAtivo) {
            try {
                const { generateWhatsAppLink } = await import("@/lib/whatsapp-link-utils");
                const link = generateWhatsAppLink(
                    cobranca.assinatura.participante.whatsappNumero,
                    mensagemTexto
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
                                mensagem: mensagemTexto,
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

        // **SE CONFIGURADO: Enviar via Meta Cloud API**
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

/**
 * Cria um lote de pagamento para múltiplas cobranças do mesmo participante.
 */
export async function criarLotePagamento(cobrancaIds: number[], isAdminView = false) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true }
        });

        const lote = await LotePagamentoService.criarLote(cobrancaIds, {
            userId: user.userId,
            contaId: userAccount?.contaId,
            isAdmin: userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false,
            isAdminView
        });

        revalidatePath("/faturas");
        return { success: true, data: lote };
    } catch (error: any) {
        console.error("[CRIAR_LOTE_PAGAMENTO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar lote de pagamento" };
    }
}

/**
 * Confirma o pagamento de um lote inteiro.
 * @param loteId ID do lote
 * @param data Pode ser a URL do comprovante (string) ou um FormData contendo o arquivo
 */
export async function confirmarLotePagamento(loteId: number, data?: FormData | string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        let comprovanteUrl = typeof data === "string" ? data : undefined;

        if (data instanceof FormData) {
            const file = data.get("comprovante") as File;
            if (file && file.size > 0) {
                comprovanteUrl = await uploadComprovante(file, file.name);
            }
        }

        if (!comprovanteUrl) {
            return { success: false, error: "Comprovante não fornecido." };
        }

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        const result = await LotePagamentoService.confirmarLote(loteId, comprovanteUrl!, {
            userId: user.userId,
            contaId: userAccount?.contaId,
            isAdmin: userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false
        });

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        revalidatePath("/");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[CONFIRMAR_LOTE_PAGAMENTO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao confirmar lote" };
    }
}

/**
 * Envia notificação WhatsApp consolidada para múltiplas cobranças por participante.
 */
export async function enviarWhatsAppEmLote(cobrancaIds: number[]) {
    try {
        const { contaId } = await getContext();

        const cobrancas = await prisma.cobranca.findMany({
            where: {
                id: { in: cobrancaIds },
                assinatura: { participante: { contaId } }
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

        if (cobrancas.length === 0) return { success: false, error: "Nenhuma cobrança válida encontrada." };

        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { moedaPreferencia: true, chavePix: true, nome: true }
        });

        // Agrupar e enviar
        const porParticipante = groupCobrancasByParticipante(cobrancas);
        const results = [];

        for (const pId in porParticipante) {
            const itens = porParticipante[pId];
            const participante = itens[0].assinatura.participante;

            if (!participante.whatsappNumero) {
                results.push({ participante: participante.nome, status: "Sem telefone" });
                continue;
            }

            const message = await buildConsolidatedWhatsAppMessage(itens, conta);
            const sendResult = await enviarWhatsAppConsolidadoHelper(contaId, pId, message, participante.whatsappNumero);

            results.push({ participante: participante.nome, success: sendResult.success });
        }

        revalidatePath("/cobrancas");
        return { success: true, data: results };
    } catch (error: any) {
        console.error("[ENVIAR_WHATSAPP_LOTE_ERROR]", error);
        return { success: false, error: "Ocorreu um erro ao processar o envio em lote." };
    }
}

/**
 * Agrupador de cobranças (Clean Code)
 */
function groupCobrancasByParticipante(cobrancas: any[]) {
    return cobrancas.reduce((acc, c) => {
        const pId = c.assinatura.participanteId;
        if (!acc[pId]) acc[pId] = [];
        acc[pId].push(c);
        return acc;
    }, {} as Record<number, any[]>);
}

/**
 * Montador de mensagem consolidada (Single Responsibility)
 */
async function buildConsolidatedWhatsAppMessage(itens: any[], conta: any) {
    const { formatCurrency } = await import("@/lib/formatCurrency");
    const moeda = (conta?.moedaPreferencia as CurrencyCode) || 'BRL';
    const total = itens.reduce((sum, i) => sum.plus(i.valor), new Prisma.Decimal(0));

    const participante = itens[0].assinatura.participante;

    const listaServicos = itens.map(i => {
        const sName = i.assinatura.streaming.apelido || i.assinatura.streaming.catalogo.nome;
        return `- *${sName}*: ${formatCurrency(i.valor.toNumber(), moeda)}`;
    }).join("\n");

    return [
        `Olá *${participante.nome}*! 👋`,
        `Identificamos faturas pendentes para seus serviços:`,
        "",
        listaServicos,
        "",
        `*Total a pagar: ${formatCurrency(total.toNumber(), moeda)}*`,
        "",
        `Chave PIX: *${conta?.chavePix}*`,
        `Titular: ${conta?.nome || 'StreamShare'}`,
        "",
        `Envie o comprovante pelo painel para liberação automática:`,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        "",
        `Obrigado! 🚀`
    ].join("\n");
}

async function enviarWhatsAppConsolidadoHelper(contaId: number, participanteId: any, mensagem: string, numero: string) {
    try {
        const whatsappConfig = await prisma.whatsAppConfig.findUnique({
            where: { contaId },
            select: { id: true, isAtivo: true }
        });

        // Se offline ou desativado, retorna link manual
        if (!whatsappConfig || !whatsappConfig.isAtivo) {
            const { generateWhatsAppLink } = await import("@/lib/whatsapp-link-utils");
            return { success: true, manualLink: generateWhatsAppLink(numero, mensagem) };
        }

        const { sendWhatsAppNotification } = await import("@/lib/whatsapp-service");
        // Nota: 'cobranca_gerada' é usado como template base para mensagens livres quando o template oficial não cobre
        const res = await sendWhatsAppNotification(contaId, "cobranca_gerada" as any, Number(participanteId), {
            texto: mensagem,
            template: { name: "cobranca_gerada", language: "pt_BR", components: [] } as any
        });
        return { success: res.success };
    } catch (e) {
        return { success: false };
    }
}

export async function getLotesUsuario() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const lotes = await prisma.lotePagamento.findMany({
            where: {
                participante: { userId: user.userId },
                status: { not: "cancelado" }
            },
            select: {
                id: true,
                status: true,
                valorTotal: true,
                createdAt: true,
                updatedAt: true,
                comprovanteUrl: true,
                referenciaMes: true,
                contaId: true,
                participante: {
                    select: {
                        id: true,
                        nome: true,
                        whatsappNumero: true,
                        conta: {
                            select: {
                                nome: true,
                                chavePix: true
                            }
                        }
                    }
                },
                cobrancas: {
                    select: {
                        id: true,
                        valor: true,
                        assinatura: {
                            select: {
                                streaming: {
                                    select: {
                                        apelido: true,
                                        catalogo: {
                                            select: {
                                                nome: true,
                                                iconeUrl: true,
                                                corPrimaria: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: lotes };
    } catch (error: any) {
        console.error("[GET_LOTES_USUARIO_ERROR]", error);
        return { success: false, error: "Erro ao buscar lotes do usuário" };
    }
}

export async function getLotesGestor() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        if (!userAccount || (userAccount.nivelAcesso !== "admin" && userAccount.nivelAcesso !== "owner")) {
            return { success: false, error: "Acesso negado" };
        }

        const lotes = await prisma.lotePagamento.findMany({
            where: {
                participante: { contaId: userAccount.contaId },
                status: { not: "cancelado" }
            },
            select: {
                id: true,
                status: true,
                valorTotal: true,
                createdAt: true,
                updatedAt: true,
                comprovanteUrl: true,
                referenciaMes: true,
                contaId: true,
                participante: {
                    select: {
                        id: true,
                        nome: true,
                        whatsappNumero: true,
                        conta: {
                            select: {
                                nome: true,
                                chavePix: true
                            }
                        }
                    }
                },
                cobrancas: {
                    select: {
                        id: true,
                        valor: true,
                        assinatura: {
                            select: {
                                streaming: {
                                    select: {
                                        apelido: true,
                                        catalogo: {
                                            select: {
                                                nome: true,
                                                iconeUrl: true,
                                                corPrimaria: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: lotes };
    } catch (error: any) {
        console.error("[GET_LOTES_GESTOR_ERROR]", error);
        return { success: false, error: "Erro ao buscar lotes da conta" };
    }
}

/**
 * Aprova um Lote de Pagamento manualmente (como admin)
 */
export async function aprovarLoteAction(loteId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        const result = await LotePagamentoService.aprovarLote(loteId, {
            userId: user.userId,
            contaId: userAccount?.contaId,
            isAdmin: userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false
        });

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        revalidatePath("/");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[APROVAR_LOTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao aprovar lote." };
    }
}

/**
 * Rejeita um Lote de Pagamento manualmente (como admin)
 */
export async function rejeitarLoteAction(loteId: number, motivo?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        const result = await LotePagamentoService.rejeitarLote(loteId, {
            userId: user.userId,
            contaId: userAccount?.contaId,
            isAdmin: userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false
        }, motivo);

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        revalidatePath("/");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[REJEITAR_LOTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao rejeitar lote." };
    }
}

/**
 * Retorna a contagem de lotes Pendentes de Avaliação (Aguardando Aprovação) para notificar o admin
 */
export async function getPendingLotesCount() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, data: 0 };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        if (!userAccount || (userAccount.nivelAcesso !== "admin" && userAccount.nivelAcesso !== "owner")) {
            return { success: false, data: 0 };
        }

        const count = await prisma.lotePagamento.count({
            where: {
                participante: { contaId: userAccount.contaId },
                status: "aguardando_aprovacao"
            }
        });

        return { success: true, data: count };
    } catch (error) {
        return { success: false, data: 0 };
    }
}

/**
 * Cancela um Lote de Pagamento (Admin ou Participante)
 */
export async function cancelarLotePagamento(loteId: number, motivo?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        await LotePagamentoService.cancelarLote(loteId, {
            userId: user.userId,
            contaId: userAccount?.contaId,
            isAdmin: userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false
        }, motivo);

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        return { success: true };
    } catch (error: any) {
        console.error("[CANCELAR_LOTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao cancelar lote." };
    }
}

/**
 * Consolidar faturas mensais de todos os participantes do organizador logado.
 */
export async function consolidarFaturasMensaisAction(referenciaMes?: string) {
    try {
        const { getCurrentUser } = await import("@/lib/auth");
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true }
        });

        if (!userAccount || (userAccount.nivelAcesso !== "admin" && userAccount.nivelAcesso !== "owner")) {
            return { success: false, error: "Acesso negado: apenas administradores podem consolidar faturas." };
        }

        const { LotePagamentoService } = await import("@/services/lote-pagamento.service");
        const result = await LotePagamentoService.consolidarFaturasMensais(userAccount.contaId, referenciaMes);

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[CONSOLIDAR_FATURAS_MENSAIS_ERROR]", error);
        return { success: false, error: error.message || "Erro ao consolidar faturas mensais" };
    }
}
/**
 * Analisa as faturas mensais (apenas retorno de read) para o modal de confirmação
 */
export async function analisarFaturasMensaisAction(referenciaMes?: string) {
    try {
        const { getCurrentUser } = await import("@/lib/auth");
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true }
        });

        if (!userAccount || (userAccount.nivelAcesso !== "admin" && userAccount.nivelAcesso !== "owner")) {
            return { success: false, error: "Acesso negado." };
        }

        const { LotePagamentoService } = await import("@/services/lote-pagamento.service");
        const analysis = await LotePagamentoService.analisarFaturasMensais(userAccount.contaId, referenciaMes);

        return {
            success: true,
            data: analysis
        };
    } catch (error: any) {
        console.error("[ANALISAR_FATURAS_MENSAIS_ERROR]", error);
        return { success: false, error: error.message || "Erro ao analisar faturas mensais" };
    }
}

/**
 * Retorna dados agregados para a visão de analytics de cobranças do organizador.
 */
export async function getCobrancasAnalytics(period: string = "6m", filters: any = {}) {
    try {
        const { contaId } = await getContext();
        const agora = new Date();
        const numMonths = period === "12m" ? 12 : 6;
        const startDate = subMonths(startOfMonth(agora), numMonths - 1);

        const isParticipantFiltered = !!(filters.participante && filters.participante !== "all");
        const isStreamingFiltered = !!(filters.streaming && filters.streaming !== "all");

        // 1. Gráfico de Rosca - Ciclo Atual
        let startCurrent = startOfMonth(agora);
        let endCurrent = endOfMonth(agora);
        let monthLabel = format(agora, "MMMM 'de' yyyy", { locale: ptBR });

        if (filters.mesReferencia && filters.mesReferencia !== "all") {
            const [year, month] = filters.mesReferencia.split('-').map(Number);
            const refDate = new Date(year, month - 1, 1);
            startCurrent = startOfMonth(refDate);
            endCurrent = endOfMonth(refDate);
            monthLabel = format(refDate, "MMMM 'de' yyyy", { locale: ptBR });
        }

        const whereBase: any = {
            deletedAt: null,
            assinatura: {
                participante: { contaId }
            }
        };

        if (filters.participante && filters.participante !== "all" && !isNaN(Number(filters.participante))) {
            whereBase.assinatura.participanteId = Number(filters.participante);
        }

        if (filters.streaming && filters.streaming !== "all" && !isNaN(Number(filters.streaming))) {
            whereBase.assinatura.streamingId = Number(filters.streaming);
        }

        if (filters.status && filters.status !== "all") {
            whereBase.status = filters.status;
        }

        if (filters.searchTerm && filters.searchTerm.trim() !== "") {
            whereBase.assinatura.participante = {
                ...whereBase.assinatura.participante,
                nome: { contains: filters.searchTerm, mode: 'insensitive' }
            };
        }

        // --- 1. Ranking por Serviço (Opção C) ---
        // Só mostramos se não estiver filtrado por participante (pois aí o foco é a pessoa)
        let serviceRanking: any[] = [];
        if (!isParticipantFiltered) {
            const statsByService = await prisma.cobranca.groupBy({
                by: ["status"],
                where: {
                    ...whereBase,
                    dataVencimento: { gte: startCurrent, lte: endCurrent },
                    status: { in: ['atrasado', 'pendente', 'aguardando_aprovacao'] } // Foco na inadimplência
                },
                _sum: { valor: true },
                _count: { _all: true },
                // @ts-ignore - Prisma nested groupBy is tricky, but let's try to get streaming names
            });

            // Como o prisma groupBy não suporta relações nadas, vamos buscar as cobranças e agrupar manualmente para precisão
            const rawCobrancas = await prisma.cobranca.findMany({
                where: {
                    ...whereBase,
                    dataVencimento: { gte: startCurrent, lte: endCurrent },
                    status: { in: ['atrasado', 'pendente', 'aguardando_aprovacao'] }
                },
                select: {
                    valor: true,
                    status: true,
                    assinatura: {
                        select: {
                            streaming: {
                                select: {
                                    apelido: true,
                                    catalogo: { select: { nome: true, corPrimaria: true } }
                                }
                            }
                        }
                    }
                }
            });

            const grouped = rawCobrancas.reduce((acc: any, curr) => {
                const name = curr.assinatura.streaming.apelido || curr.assinatura.streaming.catalogo.nome;
                if (!acc[name]) acc[name] = { name, total: 0, count: 0, color: curr.assinatura.streaming.catalogo.corPrimaria };
                acc[name].total += Number(curr.valor);
                acc[name].count += 1;
                return acc;
            }, {});

            serviceRanking = Object.values(grouped).sort((a: any, b: any) => b.total - a.total).slice(0, 5);
        }

        const currentMonthStats = await prisma.cobranca.groupBy({
            by: ["status"],
            where: {
                ...whereBase,
                dataVencimento: { gte: startCurrent, lte: endCurrent }
            },
            _count: { _all: true },
            _sum: { valor: true }
        });

        const statusColors: Record<string, string> = {
            pago: '#10b981', // Verde Suave
            aguardando_aprovacao: '#3b82f6', // Azul
            pendente: '#f5b11d', // Amarelo/Dourado
            atrasado: '#ef4444', // Vermelho Vibrante
            cancelado: '#9ca3af' // Cinza
        };

        const statusLabels: Record<string, string> = {
            pago: 'Pagas',
            aguardando_aprovacao: 'Validando',
            pendente: 'Pendentes',
            atrasado: 'Atrasadas',
            cancelado: 'Canceladas'
        };

        const donutData = currentMonthStats.map(stat => ({
            name: statusLabels[stat.status] || stat.status,
            value: stat._count._all,
            amount: stat._sum.valor?.toNumber() || 0,
            color: statusColors[stat.status] || '#cbd5e1'
        }));

        const totalExpected = donutData.reduce((acc, curr) => acc + curr.amount, 0);

        // 2. Gráfico de Barras Empilhadas - Histórico de Inadimplência
        const history = await prisma.cobranca.findMany({
            where: {
                ...whereBase,
                dataVencimento: { gte: startDate, lte: endOfMonth(agora) }
            },
            select: {
                status: true,
                valor: true,
                dataVencimento: true
            }
        });

        const monthsData: any[] = [];
        for (let i = numMonths - 1; i >= 0; i--) {
            const date = subMonths(agora, i);
            const monthName = format(date, "MMM", { locale: ptBR });
            const monthKey = format(date, "yyyy-MM");

            const monthCobrancas = history.filter(c => format(c.dataVencimento, "yyyy-MM") === monthKey);

            if (isParticipantFiltered) {
                // Para participante único, mostramos o comportamento temporal (Opção A)
                monthsData.push({
                    month: monthName,
                    key: monthKey,
                    status: monthCobrancas.length > 0 ? monthCobrancas[0].status : 'n/a',
                    valor: monthCobrancas.reduce((acc, curr) => acc + Number(curr.valor), 0),
                    delay: 0 // Poderia calcular dias de atraso aqui se tivéssemos a data de pagamento
                });
            } else {
                monthsData.push({
                    month: monthName,
                    key: monthKey,
                    Pagas: monthCobrancas.filter(c => c.status === 'pago').length,
                    Pendentes: monthCobrancas.filter(c => c.status === 'pendente' || c.status === 'aguardando_aprovacao').length,
                    Atrasadas: monthCobrancas.filter(c => c.status === 'atrasado').length,
                });
            }
        }

        return {
            success: true,
            data: {
                donutData,
                totalExpected,
                monthLabel,
                serviceRanking,
                isParticipantFiltered,
                historyData: monthsData
            }
        };
    } catch (error: any) {
        console.error("[GET_COBRANCAS_ANALYTICS_ERROR]", error);
        return { success: false, error: "Erro ao carregar dados analíticos de cobranças" };
    }
}
