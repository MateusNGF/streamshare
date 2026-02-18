"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { StatusAssinatura, StatusCobranca } from "@prisma/client";
import { billingService } from "@/services/billing-service";
import type { CurrencyCode } from "@/types/currency.types";
import { getContext } from "@/lib/action-context";
import { BulkCreateSubscriptionDTO, CreateSubscriptionDTO } from "@/types/subscription.types";
import { refundPayment } from "@/lib/mercado-pago";
import { subscriptionValidator } from "@/services/subscription-validator";

export async function getAssinaturasKPIs() {
    try {
        const { contaId } = await getContext();

        const stats = await prisma.assinatura.groupBy({
            by: ['status'],
            where: { participante: { contaId } },
            _count: { id: true },
            _sum: { valor: true }
        });

        const kpis = {
            totalAtivas: 0,
            totalSuspensas: 0,
            totalPendentes: 0,
            receitaMensalEstimada: 0,
            totalAssinaturas: 0
        };

        stats.forEach(stat => {
            kpis.totalAssinaturas += stat._count.id;
            if (stat.status === 'ativa') {
                kpis.totalAtivas = stat._count.id;
                kpis.receitaMensalEstimada += Number(stat._sum.valor || 0);
            } else if (stat.status === 'suspensa') {
                kpis.totalSuspensas = stat._count.id;
            } else if (stat.status === 'pendente') {
                kpis.totalPendentes = stat._count.id;
                kpis.receitaMensalEstimada += Number(stat._sum.valor || 0);
            }
        });

        return { success: true, data: kpis };
    } catch (error: any) {
        console.error("[GET_ASSINATURAS_KPIS_ERROR]", error);
        return { success: false, error: "Erro ao buscar KPIs de assinaturas" };
    }
}

export async function getAssinaturas(filters?: {
    status?: string;
    streamingId?: string;
    searchTerm?: string;
    dataInicioRange?: string; // JSON string with from/to
    valorMin?: number;
    valorMax?: number;
    hasWhatsapp?: boolean;
}) {
    try {
        const { contaId } = await getContext();

        const whereClause: any = {
            participante: { contaId },
        };

        if (filters?.status && filters.status !== "all") {
            whereClause.status = filters.status;
        } else {
            whereClause.status = { not: StatusAssinatura.cancelada };
        }

        if (filters?.streamingId && filters.streamingId !== "all") {
            whereClause.streamingId = parseInt(filters.streamingId);
        }

        if (filters?.searchTerm && filters.searchTerm.trim() !== "") {
            whereClause.participante = {
                ...whereClause.participante,
                nome: {
                    contains: filters.searchTerm,
                    mode: 'insensitive'
                }
            };
        }

        if (filters?.valorMin !== undefined || filters?.valorMax !== undefined) {
            whereClause.valor = {};
            if (filters.valorMin !== undefined) whereClause.valor.gte = filters.valorMin;
            if (filters.valorMax !== undefined) whereClause.valor.lte = filters.valorMax;
        }

        if (filters?.hasWhatsapp !== undefined) {
            whereClause.participante = {
                ...whereClause.participante,
                whatsappNumero: filters.hasWhatsapp ? { not: null } : null
            };
        }

        if (filters?.dataInicioRange) {
            try {
                const range = JSON.parse(filters.dataInicioRange);
                if (range.from || range.to) {
                    whereClause.dataInicio = {};
                    if (range.from) whereClause.dataInicio.gte = new Date(range.from);
                    if (range.to) whereClause.dataInicio.lte = new Date(range.to);
                }
            } catch (e) {
                console.error("Error parsing dataInicioRange", e);
            }
        }

        const data = await prisma.assinatura.findMany({
            where: whereClause,
            include: {
                participante: true,
                streaming: {
                    include: { catalogo: true }
                },
                cobrancas: {
                    orderBy: { periodoFim: "desc" }
                },
                canceladoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_ASSINATURAS_ERROR]", error);
        return { success: false, error: "Erro ao buscar assinaturas" };
    }
}

export async function createAssinatura(data: CreateSubscriptionDTO) {
    try {
        const { contaId, userId } = await getContext();

        // 1. Validations (SRP - Delegated to Validator)
        subscriptionValidator.validateValues(data.valor);

        // Ensure dataInicio is a Date object
        const dataInicio = typeof data.dataInicio === 'string' ? new Date(data.dataInicio) : data.dataInicio;
        subscriptionValidator.validateDates(dataInicio);

        // 2. Transaction (Atomicity)
        const result = await prisma.$transaction(async (tx) => {
            // Business Checks
            const streaming = await subscriptionValidator.validateStreamingAccess(data.streamingId, contaId);
            subscriptionValidator.validateSlotAvailability(streaming);
            await subscriptionValidator.validateDuplicateSubscription(data.participanteId, data.streamingId);

            // Create Subscription
            const assinatura = await tx.assinatura.create({
                data: {
                    participanteId: data.participanteId,
                    streamingId: data.streamingId,
                    frequencia: data.frequencia,
                    valor: data.valor,
                    dataInicio: dataInicio,
                    status: (data.cobrancaAutomaticaPaga ?? false) ? StatusAssinatura.ativa : StatusAssinatura.pendente,
                    cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                },
            });

            // Create Initial Charge (Delegated to Billing Service)
            const cobranca = await billingService.gerarCobrancaInicial(tx, {
                assinaturaId: assinatura.id,
                valorMensal: data.valor,
                frequencia: data.frequencia,
                dataInicio,
                pago: !!data.cobrancaAutomaticaPaga
            });

            const participante = await tx.participante.findUnique({
                where: { id: data.participanteId },
                select: { nome: true, contaId: true, userId: true },
            });

            // System Notification
            // User requested: Notifications must refer to the user (subscription owner)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: participante?.userId || userId, // Target participant if linked, otherwise creator/admin
                    tipo: "assinatura_criada",
                    titulo: `Nova assinatura criada`,
                    descricao: `Assinatura de ${streaming.catalogo.nome} para ${participante?.nome || 'participante'} foi criada.`,
                    entidadeId: assinatura.id,
                    lida: false
                }
            });

            return { assinatura, cobranca, participante, streaming };
        });

        // 3. Side Effects (Async Notifications)
        await sendWhatsAppSafely(result, data.valor, dataInicio);

        revalidateAllPaths();
        return { success: true, data: result.assinatura };
    } catch (error: any) {
        console.error("[CREATE_ASSINATURA_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar assinatura" };
    }
}

export async function createBulkAssinaturas(data: BulkCreateSubscriptionDTO) {
    try {
        const { contaId, userId } = await getContext();
        const dataInicio = typeof data.dataInicio === 'string' ? new Date(data.dataInicio) : data.dataInicio;
        const results: Array<{ streamingId: number; assinaturaId: number; participanteId: number }> = [];

        await prisma.$transaction(async (tx) => {
            const validStreamings = new Map();

            // 1. Validate Streamings & Slots
            for (const ass of data.assinaturas) {
                if (validStreamings.has(ass.streamingId)) continue;
                const streaming = await tx.streaming.findUnique({
                    where: { id: ass.streamingId },
                    include: { catalogo: true, _count: { select: { assinaturas: { where: { status: { in: ['ativa', 'suspensa', 'pendente'] } } } } } }
                });

                if (!streaming) throw new Error(`Streaming ID ${ass.streamingId} não encontrado`);
                if (streaming.contaId !== contaId) throw new Error(`Sem permissão para ${streaming.catalogo.nome}`);

                // Check capacity for ALL participants
                const currentCount = streaming._count.assinaturas;
                const needed = data.participanteIds.length;
                if (currentCount + needed > streaming.limiteParticipantes) {
                    throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes.`);
                }
                validStreamings.set(ass.streamingId, streaming);
            }

            // 2. Create Subscriptions
            for (const participanteId of data.participanteIds) {
                for (const ass of data.assinaturas) {
                    const assinatura = await tx.assinatura.create({
                        data: {
                            participanteId,
                            streamingId: ass.streamingId,
                            frequencia: ass.frequencia,
                            valor: ass.valor,
                            dataInicio,
                            status: (data.cobrancaAutomaticaPaga ?? false) ? 'ativa' : 'pendente',
                            cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                        }
                    });

                    // 3. Create Initial Charge (Delegated to Billing Service)
                    await billingService.gerarCobrancaInicial(tx, {
                        assinaturaId: assinatura.id,
                        valorMensal: ass.valor,
                        frequencia: ass.frequencia,
                        dataInicio,
                        pago: !!data.cobrancaAutomaticaPaga
                    });

                    results.push({ streamingId: ass.streamingId, assinaturaId: assinatura.id, participanteId });
                }
            }

            // 4. Notification
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: userId,
                    tipo: "assinatura_criada",
                    titulo: `Assinaturas criadas em lote`,
                    descricao: `${results.length} assinatura(s) criada(s) para ${data.participanteIds.length} participante(s).`,
                    lida: false,
                    metadata: {
                        assinaturasIds: results.map((a) => a.assinaturaId),
                        participantesIds: data.participanteIds,
                    }
                }
            });
        });

        revalidateAllPaths();
        return { success: true, data: { created: results.length, assinaturas: results } };
    } catch (error: any) {
        console.error("[CREATE_BULK_ASSINATURAS_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar assinaturas em lote" };
    }
}

export async function cancelarAssinatura(assinaturaId: number, motivo?: string) {
    try {
        const { contaId, userId } = await getContext();

        const assinatura = await prisma.assinatura.findUnique({
            where: { id: assinaturaId },
            include: {
                participante: true,
                streaming: { include: { catalogo: true } },
                cobrancas: { where: { status: "pago" }, orderBy: { periodoFim: "desc" }, take: 1 }
            }
        });

        if (!assinatura) return { success: false, error: "Assinatura não encontrada" };
        if (assinatura.participante.contaId !== contaId) return { success: false, error: "Permissão negada" };
        if (assinatura.status === 'cancelada') return { success: false, error: "Já cancelada" };
        if (!['ativa', 'suspensa'].includes(assinatura.status)) return { success: false, error: "Status inválido para cancelamento" };

        const ultimaCobrancaPaga = assinatura.cobrancas[0];
        const agora = new Date();

        let novoStatus: StatusAssinatura = StatusAssinatura.cancelada;
        let agendado = false;

        if (ultimaCobrancaPaga && ultimaCobrancaPaga.periodoFim > agora) {
            novoStatus = StatusAssinatura.ativa;
            agendado = true;
        }

        const updated = await prisma.$transaction(async (tx) => {
            const res = await tx.assinatura.update({
                where: { id: assinaturaId },
                data: {
                    status: novoStatus,
                    dataCancelamento: new Date(),
                    motivoCancelamento: motivo || "Não informado.",
                    canceladoPorId: userId,
                    updatedAt: new Date()
                }
            });

            // Se for cancelamento IMEDIATO (sem período restante ou solicitado reembolso)
            // Vamos verificar se existe uma cobrança PAGA para estornar
            if (novoStatus === StatusAssinatura.cancelada && ultimaCobrancaPaga?.gatewayId) {
                // Tenta realizar o estorno direto no gateway
                const refundRes = await refundPayment(ultimaCobrancaPaga.gatewayId);

                if (refundRes.success) {
                    await tx.cobranca.update({
                        where: { id: ultimaCobrancaPaga.id },
                        data: {
                            status: StatusCobranca.estornado,
                            metadataJson: {
                                ...(ultimaCobrancaPaga.metadataJson as any || {}),
                                refundedAt: new Date().toISOString(),
                                refundData: refundRes.data
                            }
                        }
                    });
                }
            }

            const dataFim = ultimaCobrancaPaga?.periodoFim ? ultimaCobrancaPaga.periodoFim.toLocaleDateString('pt-BR') : 'hoje';

            await tx.notificacao.create({
                data: {
                    contaId,
                    tipo: "assinatura_cancelada",
                    usuarioId: assinatura.participante.userId || userId,
                    titulo: agendado ? "Cancelamento agendado" : "Assinatura cancelada",
                    descricao: agendado
                        ? `O cancelamento da assinatura de ${assinatura.participante.nome} foi agendado. O acesso continua liberado até ${dataFim}.`
                        : `Assinatura de ${assinatura.streaming.catalogo.nome} para ${assinatura.participante.nome} foi cancelada.${ultimaCobrancaPaga?.gatewayId ? " Estorno solicitado à origem." : ""}`,
                    entidadeId: assinaturaId,
                    lida: false
                }
            });
            return res;
        });

        revalidateAllPaths();
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("[CANCELAR_ASSINATURA_ERROR]", error);
        return { success: false, error: error.message || "Erro ao cancelar assinatura" };
    }
}

// --- Helpers ---

async function sendWhatsAppSafely(result: any, valor: number, dataInicio: Date) {
    try {
        const { sendWhatsAppNotification, whatsappTemplates } = await import("@/lib/whatsapp-service");
        const { formatCurrency } = await import("@/lib/formatCurrency");

        const conta = await prisma.conta.findUnique({
            where: { id: result.participante.contaId },
            select: { moedaPreferencia: true }
        });

        const mensagem = whatsappTemplates.novaAssinatura(
            result.participante.nome,
            result.streaming.catalogo.nome,
            formatCurrency(valor, (conta?.moedaPreferencia as CurrencyCode) || 'BRL'),
            dataInicio.toLocaleDateString("pt-BR")
        );

        await sendWhatsAppNotification(
            result.participante.contaId,
            "nova_assinatura",
            result.assinatura.participanteId,
            mensagem
        );
    } catch (error) {
        console.error("WhatsApp notification failed:", error);
    }
}

function revalidateAllPaths() {
    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");
    revalidatePath("/cobrancas");
}

/**
 * @deprecated Use createBulkAssinaturas
 */
export async function createMultipleAssinaturas(data: any) {
    return createBulkAssinaturas({
        participanteIds: [data.participanteId],
        assinaturas: data.assinaturas,
        dataInicio: data.dataInicio,
        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga
    });
}
