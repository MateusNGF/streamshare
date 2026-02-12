"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, StatusAssinatura } from "@prisma/client";
import { criarCobrancaInicial } from "./cobrancas";
import {
    calcularProximoVencimento,
    calcularValorPeriodo,
    calcularDataVencimentoPadrao
} from "@/lib/financeiro-utils";
import type { CurrencyCode } from "@/types/currency.types";
import { getContext } from "@/lib/action-context";
import { BulkCreateSubscriptionDTO, CreateSubscriptionDTO } from "@/types/subscription.types";

export async function getAssinaturasKPIs() {
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
        receitaMensalEstimada: 0,
        totalAssinaturas: 0
    };

    stats.forEach(stat => {
        kpis.totalAssinaturas += stat._count.id;
        if (stat.status === 'ativa') {
            kpis.totalAtivas = stat._count.id;
            kpis.receitaMensalEstimada = Number(stat._sum.valor || 0);
        } else if (stat.status === 'suspensa') {
            kpis.totalSuspensas = stat._count.id;
        }
    });

    return kpis;
}
import { subscriptionValidator } from "@/services/subscription-validator";

export async function getAssinaturas(filters?: {
    status?: string;
    streamingId?: string;
    searchTerm?: string;
}) {
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
            contaId,
            nome: {
                contains: filters.searchTerm,
                mode: 'insensitive'
            }
        };
    }

    return prisma.assinatura.findMany({
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
}

export async function createAssinatura(data: CreateSubscriptionDTO) {
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
                status: StatusAssinatura.ativa,
                cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
            },
        });

        // Create Initial Charge
        const periodoInicio = dataInicio;
        const periodoFim = calcularProximoVencimento(periodoInicio, data.frequencia, dataInicio);
        const valorCobranca = calcularValorPeriodo(data.valor, data.frequencia);

        const cobranca = await tx.cobranca.create({
            data: {
                assinaturaId: assinatura.id,
                valor: valorCobranca,
                periodoInicio,
                periodoFim,
                status: data.cobrancaAutomaticaPaga ? "pago" : "pendente",
                dataPagamento: data.cobrancaAutomaticaPaga ? new Date() : null,
                dataVencimento: calcularDataVencimentoPadrao()
            }
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
    return result.assinatura;
}

export async function createBulkAssinaturas(data: BulkCreateSubscriptionDTO) {
    const { contaId, userId } = await getContext();
    const dataInicio = typeof data.dataInicio === 'string' ? new Date(data.dataInicio) : data.dataInicio;
    const results: Array<{ streamingId: number; assinaturaId: number; participanteId: number }> = [];

    await prisma.$transaction(async (tx) => {
        // Bulk validations logic...
        // For brevity and considering the "turbo" nature, we'll keep the logic inline but clean it up if needed.
        // Actually, let's reuse the validator where possible or keep specific bulk logic here.

        // ... (preserving bulk logic flows but cleaning up)
        // Note: Full refactor of bulk logic to use single-item validators in a loop or optimized batch checks.
        // Given complexity, we will keep the optimized batch fetching pattern from original code but clean it up.

        const validStreamings = new Map();

        // 1. Validate Streamings & Slots
        for (const ass of data.assinaturas) {
            if (validStreamings.has(ass.streamingId)) continue;
            // Uses standard validator but we need the object return, so we might need to adjust or call finding manually.
            const streaming = await tx.streaming.findUnique({
                where: { id: ass.streamingId },
                include: { catalogo: true, _count: { select: { assinaturas: { where: { status: { in: ['ativa', 'suspensa'] } } } } } }
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
                // Removed findFirst check to allow multiple subscriptions for same participant/streaming pairing (e.g. Marina x2)
                const assinatura = await tx.assinatura.create({
                    data: {
                        participanteId,
                        streamingId: ass.streamingId,
                        frequencia: ass.frequencia,
                        valor: ass.valor,
                        dataInicio,
                        status: 'ativa',
                        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                    }
                });

                // 3. Create Initial Charge (Atomicity Improvement D-08)
                const periodoInicio = dataInicio;
                const periodoFim = calcularProximoVencimento(periodoInicio, ass.frequencia, dataInicio);
                const valorCobranca = calcularValorPeriodo(ass.valor, ass.frequencia);

                const isCobrancaPaga = data?.cobrancaAutomaticaPaga ?? false;

                await tx.cobranca.create({
                    data: {
                        assinaturaId: assinatura.id,
                        valor: valorCobranca,
                        periodoInicio,
                        periodoFim,
                        status: isCobrancaPaga ? "pago" : "pendente",
                        dataPagamento: isCobrancaPaga ? new Date() : null,
                        dataVencimento: calcularDataVencimentoPadrao()
                    }
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
    return { created: results.length, assinaturas: results };
}

export async function cancelarAssinatura(assinaturaId: number, motivo?: string) {
    const { contaId, userId } = await getContext();

    const assinatura = await prisma.assinatura.findUnique({
        where: { id: assinaturaId },
        include: {
            participante: true,
            streaming: { include: { catalogo: true } },
            cobrancas: { where: { status: "pago" }, orderBy: { periodoFim: "desc" }, take: 1 }
        }
    });

    if (!assinatura) throw new Error("Assinatura não encontrada");
    if (assinatura.participante.contaId !== contaId) throw new Error("Permissão negada");
    if (assinatura.status === 'cancelada') throw new Error("Já cancelada");
    if (!['ativa', 'suspensa'].includes(assinatura.status)) throw new Error("Status inválido para cancelamento");

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
    return updated;
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
