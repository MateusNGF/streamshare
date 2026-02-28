"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

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
export async function criarLotePagamento(cobrancaIds: number[]) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado" };

        // Tenta pegar contaId via contexto admin ou via participação
        let activeContaId = null;
        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
        });

        if (userAccount) {
            activeContaId = userAccount.contaId;
        }

        if (!cobrancaIds || cobrancaIds.length === 0) {
            return { success: false, error: "Nenhuma cobrança selecionada" };
        }

        const cobrancas = await prisma.cobranca.findMany({
            where: {
                id: { in: cobrancaIds },
                status: "pendente",
                lotePagamentoId: null,
                assinatura: {
                    participante: activeContaId ? { contaId: activeContaId } : { userId: user.userId }
                }
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

        if (cobrancas.length === 0) {
            return { success: false, error: "Nenhuma cobrança pendente e livre de lotes foi encontrada na seleção." };
        }

        if (cobrancas.length !== cobrancaIds.length) {
            return { success: false, error: "Algumas cobranças selecionadas já foram pagas ou já pertencem a outro lote." };
        }

        // Validação: Todas devem ser do mesmo participante
        const participanteId = cobrancas[0].assinatura.participanteId;
        const differentParticipant = cobrancas.some(c => c.assinatura.participanteId !== participanteId);

        if (differentParticipant) {
            return { success: false, error: "Todas as cobranças devem ser do mesmo participante para pagamento em lote" };
        }

        const valorTotal = cobrancas.reduce((sum, c) => sum.plus(c.valor), new Prisma.Decimal(0));

        const lote = await prisma.lotePagamento.create({
            data: {
                participanteId,
                valorTotal,
                status: "pendente",
                cobrancas: {
                    connect: cobrancas.map(c => ({ id: c.id }))
                }
            },
            select: {
                id: true,
                status: true,
                valorTotal: true,
                createdAt: true,
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
            }
        });

        revalidatePath("/faturas");
        return { success: true, data: lote };
    } catch (error: any) {
        console.error("[CRIAR_LOTE_PAGAMENTO_ERROR]", error);
        return { success: false, error: "Erro ao criar lote de pagamento" };
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

        // Tenta identificar se o user é admin dessa conta
        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: user.userId, isAtivo: true },
            select: { contaId: true, nivelAcesso: true },
        });

        const isAdmin = userAccount ? (userAccount.nivelAcesso === "admin" || userAccount.nivelAcesso === "owner") : false;
        const adminContaId = userAccount?.contaId;

        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: {
                participante: { include: { conta: true } },
                cobrancas: {
                    include: {
                        assinatura: {
                            include: {
                                participante: true,
                                streaming: { include: { catalogo: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!lote || lote.cobrancas.length === 0) {
            return { success: false, error: "Lote não encontrado" };
        }

        if (lote.status !== "pendente") {
            return { success: false, error: `Este lote já possui o status ${lote.status} e não pode ser confirmado novamente.` };
        }

        // Permissão: Admin da conta OU o próprio participante
        const canConfirm = (isAdmin && lote.participante.contaId === adminContaId) || (lote.participante.userId === user.userId);

        if (!canConfirm) {
            return { success: false, error: "Sem permissão para este lote" };
        }

        const effectiveContaId = lote.participante.contaId;
        const result = await processBatchConfirmation(lote, isAdmin, effectiveContaId, comprovanteUrl);

        revalidatePath("/cobrancas");
        revalidatePath("/faturas");
        revalidatePath("/");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[CONFIRMAR_LOTE_PAGAMENTO_ERROR]", error);
        return { success: false, error: "Erro ao confirmar lote" };
    }
}

/**
 * Helper para processar a transação de confirmação de lote (SOLID)
 */
async function processBatchConfirmation(lote: any, isAdmin: boolean, contaId: number, comprovanteUrl?: string) {
    return await prisma.$transaction(async (tx) => {
        const status = isAdmin ? "pago" : "aguardando_aprovacao";
        const agora = new Date();

        // 1. Atualizar Status do Lote
        const updatedLote = await tx.lotePagamento.update({
            where: { id: lote.id },
            data: { status, comprovanteUrl }
        });

        // 2. Atualizar todas as cobranças vinculadas
        await tx.cobranca.updateMany({
            where: { lotePagamentoId: lote.id },
            data: {
                status,
                dataPagamento: isAdmin ? agora : null,
                dataEnvioComprovante: !isAdmin ? agora : null,
                comprovanteUrl
            }
        });

        // 3. Ativações (Apenas Admin)
        if (isAdmin) {
            for (const cobranca of lote.cobrancas) {
                await billingService.avaliarAtivacaoAposPagamento(tx, {
                    assinatura: cobranca.assinatura,
                    cobranca: { ...cobranca, status: "pago", dataPagamento: agora },
                    contaId,
                    agora
                });
            }
        }

        // 4. Notificações centralizadas
        await createBatchNotification(tx, lote, isAdmin, contaId);

        return updatedLote;
    });
}

async function createBatchNotification(tx: any, lote: any, isAdmin: boolean, contaId: number) {
    const nomeParticipante = lote.cobrancas[0].assinatura.participante.nome;
    const desc = `Lote #${lote.id} (${lote.cobrancas.length} itens) de ${nomeParticipante} no valor de ${lote.valorTotal}.`;

    return await tx.notificacao.create({
        data: {
            contaId,
            usuarioId: null, // Admin notification
            tipo: "cobranca_confirmada",
            titulo: isAdmin ? "Lote Confirmado Manual" : "Lote Aguardando Aprovação",
            descricao: desc,
            entidadeId: lote.id,
            lida: false
        }
    });
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
        const res = await sendWhatsAppNotification(contaId, "cobranca_gerada" as any, Number(participanteId), mensagem);
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
                participante: { userId: user.userId }
            },
            select: {
                id: true,
                status: true,
                valorTotal: true,
                createdAt: true,
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
                participante: { contaId: userAccount.contaId }
            },
            select: {
                id: true,
                status: true,
                valorTotal: true,
                createdAt: true,
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

