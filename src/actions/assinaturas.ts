"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, StatusAssinatura, Prisma } from "@prisma/client";
import { billingService } from "@/services/billing-service";
import type { CurrencyCode } from "@/types/currency.types";
import { getContext } from "@/lib/action-context";
import { BulkCreateSubscriptionDTO, CreateSubscriptionDTO } from "@/types/subscription.types";
import {
    parseLocalDate,
    determinarStatusInicial,
    escolherProximoDiaVencimento,
    calcularDataVencimentoPadrao,
    calcularProximoVencimento,
    calcularValorProRata,
    calcularValorPeriodo,
    gerarCiclosRetroativos
} from "@/lib/financeiro-utils";
import { SubscriptionBulkService } from "@/services/subscription-bulk-service";
import { chargeFactory } from "@/services/charge-factory";
import { subscriptionValidator } from "@/services/subscription-validator";
import { startOfDay, isBefore } from "date-fns";

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
    dataVencimentoRange?: string; // JSON string with from/to
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

        if (filters?.dataVencimentoRange) {
            try {
                const range = JSON.parse(filters.dataVencimentoRange);
                if (range.from || range.to) {
                    whereClause.cobrancas = {
                        some: {
                            dataVencimento: {}
                        }
                    };
                    if (range.from) whereClause.cobrancas.some.dataVencimento.gte = new Date(range.from);
                    if (range.to) whereClause.cobrancas.some.dataVencimento.lte = new Date(range.to);
                }
            } catch (e) {
                console.error("Error parsing dataVencimentoRange", e);
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

        // Ensure dataInicio is a Date object (Safely parsing local time)
        const dataInicio = parseLocalDate(data.dataInicio);
        subscriptionValidator.validateDates(dataInicio);

        const hoje = startOfDay(new Date());
        const isRetroactive = isBefore(startOfDay(dataInicio), hoje);

        // 2. Transaction (Atomicity)
        const result = await prisma.$transaction(async (tx) => {
            // Business Checks
            const streaming = await subscriptionValidator.validateStreamingAccess(data.streamingId, contaId);
            subscriptionValidator.validateSlotAvailability(streaming);
            await subscriptionValidator.validateDuplicateSubscription(data.participanteId, data.streamingId);

            const contaInfo = await tx.conta.findUnique({
                where: { id: contaId },
                select: { diasVencimento: true }
            });
            const diasVencimento = contaInfo?.diasVencimento || [];

            const status = determinarStatusInicial({
                primeiroCicloJaPago: !!data.primeiroCicloJaPago,
                cobrancaAutomaticaPaga: !!data.cobrancaAutomaticaPaga,
                isRetroactive,
                hasPaidRetroactive: (data.retroactivePaidPeriods?.length || 0) > 0 || (data.retroactivePaidIndices?.length || 0) > 0
            });

            // Create Subscription
            const assinatura = await tx.assinatura.create({
                data: {
                    participanteId: data.participanteId,
                    streamingId: data.streamingId,
                    frequencia: data.frequencia,
                    valor: data.valor,
                    dataInicio: dataInicio,
                    status: status,
                    cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                },
            });

            // 2. Initial/Retroactive Charge Logic (Delegated to Factory)
            const chargeParams = {
                assinaturaId: assinatura.id,
                valorMensal: data.valor,
                frequencia: data.frequencia,
                dataInicio,
                diasVencimento,
                isPaid: !!data.primeiroCicloJaPago || !!data.cobrancaAutomaticaPaga,
                manualMigration: !!data.primeiroCicloJaPago
            };

            if (isRetroactive) {
                const chargesData = chargeFactory.createRetroactiveChargesData({
                    ...chargeParams,
                    paidIndices: data.retroactivePaidPeriods?.map(p => p.index) || data.retroactivePaidIndices || []
                });
                await tx.cobranca.createMany({ data: chargesData });
            } else {
                const chargeData = chargeFactory.createInitialChargeData(chargeParams);
                await tx.cobranca.create({ data: chargeData });
            }

            const participante = await tx.participante.findUnique({
                where: { id: data.participanteId },
                select: { nome: true, contaId: true, userId: true },
            });

            // System Notification
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: participante?.userId || userId,
                    tipo: "assinatura_criada",
                    titulo: `Nova assinatura criada`,
                    descricao: `Assinatura de ${streaming.catalogo.nome} para ${participante?.nome || 'participante'} foi criada.`,
                    entidadeId: assinatura.id,
                    lida: false
                }
            });

            return { assinatura, participante, streaming };
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
    const startTime = performance.now();
    try {
        const { contaId, userId } = await getContext();
        const dataInicio = parseLocalDate(data.dataInicio);

        const uniqueParticipantes = new Set(data.assinaturasDedicadas.map(a => a.participanteId));
        console.log(`[BULK_ASSINATURA] Iniciando criação em lote (${data.assinaturasDedicadas.length} assinaturas para ${uniqueParticipantes.size} participantes).`);

        const result = await prisma.$transaction(async (tx) => {
            const txStartTime = performance.now();

            // 1. Core Logic Delegated to Service (SRP)
            const { results, cobrancasParaCriar, streamingsData } = await SubscriptionBulkService.processBulkCreation(tx, data, { contaId, userId });

            // 2. Bulk Insert Charges
            if (cobrancasParaCriar.length > 0) {
                await tx.cobranca.createMany({ data: cobrancasParaCriar as any });
            }

            // 3. Global Notification for the batch + Individual Notifications
            const notificacoesParaCriar = data.assinaturasDedicadas.map(ass => {
                const found = results.find((r: any) => r.participanteId === ass.participanteId && r.streamingId === ass.streamingId);
                return {
                    contaId,
                    usuarioId: null,
                    tipo: "assinatura_criada",
                    titulo: `Nova assinatura`,
                    descricao: `Criada via processamento em lote.`,
                    entidadeId: found ? Number(found.assinaturaId) : undefined,
                };
            });

            await tx.notificacao.createMany({
                data: [
                    {
                        contaId,
                        usuarioId: userId as number,
                        tipo: "assinatura_criada",
                        titulo: `Assinaturas criadas em lote`,
                        descricao: `${results.length} assinatura(s) para ${uniqueParticipantes.size} participante(s).`,
                        metadata: { assinaturasIds: results.map((a: any) => a.assinaturaId) } as any
                    },
                    ...notificacoesParaCriar.filter(n => n.entidadeId !== undefined) as any[]
                ]
            });

            const txDuration = performance.now() - txStartTime;
            console.log(`[PERF_INFO] Transação concluída em ${txDuration.toFixed(2)}ms.`);

            return { results, streamingsData };
        }, { timeout: 30000 });

        // 4. Side Effects (Async Meta API Notifications)
        const triggerWhatsApp = async () => {
            const { results, streamingsData } = result;
            const whatsappPromises = data.assinaturasDedicadas.map(async (ass) => {
                const participante = await prisma.participante.findUnique({ where: { id: ass.participanteId } });
                if (!participante) return;

                const streaming = streamingsData.find(s => s.id === ass.streamingId);
                if (streaming) {
                    await sendWhatsAppSafely({
                        participante: { ...participante, contaId },
                        streaming: streaming,
                        assinatura: { id: -1, participanteId: ass.participanteId }
                    }, ass.valor, dataInicio);
                }
            });
            await Promise.allSettled(whatsappPromises);
        };

        triggerWhatsApp().catch(e => console.error("[WHATSAPP_BULK_FAILURE]", e));

        revalidateAllPaths();
        return { success: true, data: { created: result.results.length, assinaturas: result.results } };
    } catch (error: any) {
        console.error(`[BULK_ASSINATURA_ERROR]`, error);
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

            const dataFim = ultimaCobrancaPaga?.periodoFim ? ultimaCobrancaPaga.periodoFim.toLocaleDateString('pt-BR') : 'hoje';

            await tx.notificacao.create({
                data: {
                    contaId,
                    tipo: "assinatura_cancelada",
                    usuarioId: assinatura.participante.userId || userId,
                    titulo: agendado ? "Cancelamento agendado" : "Assinatura cancelada",
                    descricao: agendado
                        ? `O cancelamento da assinatura de ${assinatura.participante.nome} foi agendado. O acesso continua liberado até ${dataFim}.`
                        : `Assinatura de ${assinatura.streaming.catalogo.nome} para ${assinatura.participante.nome} foi cancelada.`,
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
        assinaturasDedicadas: data.assinaturas.map((a: any) => ({
            participanteId: data.participanteId,
            streamingId: a.streamingId,
            frequencia: a.frequencia,
            valor: a.valor
        })),
        dataInicio: data.dataInicio,
        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga
    });
}
