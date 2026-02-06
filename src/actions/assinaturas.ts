"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, StatusAssinatura } from "@prisma/client";
import { criarCobrancaInicial } from "./cobrancas";
import {
    calcularProximoVencimento,
    calcularValorPeriodo
} from "@/lib/financeiro-utils";
import type { CurrencyCode } from "@/types/currency.types";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId };
}

export async function getAssinaturas(filters?: {
    status?: string;
    streamingId?: string;
    searchTerm?: string;
}) {
    const { contaId } = await getContext();

    // Build where clause based on filters
    const whereClause: any = {
        participante: { contaId },
    };

    // Status filter - exclude 'cancelada' by default when no status is specified
    if (filters?.status && filters.status !== "all") {
        whereClause.status = filters.status;
    } else {
        // When "all" or no filter, exclude cancelled subscriptions
        whereClause.status = {
            not: StatusAssinatura.cancelada
        };
    }

    // Streaming filter
    if (filters?.streamingId && filters.streamingId !== "all") {
        whereClause.streamingId = parseInt(filters.streamingId);
    }

    // Search filter (participant name)
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
                include: {
                    catalogo: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createAssinatura(data: {
    participanteId: number;
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: number;
    dataInicio: string; // ISO Date string
    cobrancaAutomaticaPaga?: boolean;
}) {
    const { contaId } = await getContext(); // Validate auth

    // Business validations
    if (!Number.isFinite(data.valor) || data.valor <= 0) {
        throw new Error("Valor da assinatura deve ser maior que zero");
    }

    // Validate date
    const dataInicio = new Date(data.dataInicio);
    if (isNaN(dataInicio.getTime())) {
        throw new Error("Data de início inválida");
    }

    // Validate that date is not too far in the past (> 1 year ago)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (dataInicio < oneYearAgo) {
        throw new Error("Data de início não pode ser superior a 1 ano no passado");
    }

    // Validate that date is not too far in the future (> 1 month)
    const oneMonthAhead = new Date();
    oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);
    if (dataInicio > oneMonthAhead) {
        throw new Error("Data de início não pode ser superior a 1 mês no futuro");
    }

    // Use transaction to ensure atomicity between subscription and initial charge creation
    const result = await prisma.$transaction(async (tx) => {
        // Validations
        const streaming = await tx.streaming.findUnique({
            where: { id: data.streamingId },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa] }
                            }
                        }
                    }
                }
            }
        });

        if (!streaming) {
            throw new Error("Streaming não encontrado");
        }

        if (streaming.contaId !== contaId) {
            throw new Error("Você não tem permissão para usar este streaming");
        }

        // Check slot availability
        const assinaturasAtivas = streaming._count.assinaturas;
        if (assinaturasAtivas >= streaming.limiteParticipantes) {
            throw new Error(`${streaming.catalogo.nome}: Sem vagas disponíveis (${assinaturasAtivas}/${streaming.limiteParticipantes})`);
        }

        const existing = await tx.assinatura.findFirst({
            where: {
                participanteId: data.participanteId,
                streamingId: data.streamingId,
                NOT: {
                    status: StatusAssinatura.cancelada
                }
            }
        });

        if (existing) {
            throw new Error("Participante já possui uma assinatura ativa ou suspensa para este streaming.");
        }

        // Create subscription
        const assinatura = await tx.assinatura.create({
            data: {
                participanteId: data.participanteId,
                streamingId: data.streamingId,
                frequencia: data.frequencia,
                valor: data.valor,
                dataInicio: dataInicio,
                status: StatusAssinatura.ativa,
                diasAtraso: 0,
                cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
            },
        });

        // Auto-generate first charge within the same transaction
        const periodoInicio = dataInicio;
        const periodoFim = calcularProximoVencimento(periodoInicio, data.frequencia);
        const valorCobranca = calcularValorPeriodo(new (await import("@prisma/client")).Prisma.Decimal(data.valor.toString()), data.frequencia);

        const cobranca = await tx.cobranca.create({
            data: {
                assinaturaId: assinatura.id,
                valor: valorCobranca,
                periodoInicio,
                periodoFim,
                status: data.cobrancaAutomaticaPaga ? "pago" : "pendente",
                dataPagamento: data.cobrancaAutomaticaPaga ? new Date() : null,
            }
        });

        // Fetch participant data for WhatsApp notification
        const participante = await tx.participante.findUnique({
            where: { id: data.participanteId },
            select: { nome: true, contaId: true },
        });

        return { assinatura, cobranca, participante, streaming };
    });

    // Send WhatsApp notification (outside transaction - not critical)
    try {
        const { sendWhatsAppNotification, whatsappTemplates } = await import("@/lib/whatsapp-service");
        const { formatCurrency } = await import("@/lib/formatCurrency");

        if (result.participante && result.streaming) {
            // Fetch user's currency preference
            const conta = await prisma.conta.findUnique({
                where: { id: result.participante.contaId },
                select: { moedaPreferencia: true }
            });

            const mensagem = whatsappTemplates.novaAssinatura(
                result.participante.nome,
                result.streaming.catalogo.nome,
                formatCurrency(data.valor, (conta?.moedaPreferencia as CurrencyCode) || 'BRL'),
                dataInicio.toLocaleDateString("pt-BR")
            );

            await sendWhatsAppNotification(
                result.participante.contaId,
                "nova_assinatura",
                data.participanteId,
                mensagem
            );
        }
    } catch (error) {
        // Log but don't fail the operation
        console.error("Erro ao enviar notificação WhatsApp:", error);
    }

    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");
    revalidatePath("/cobrancas");

    return result.assinatura;
}

/**
 * Create multiple subscriptions for ONE participant at once
 * @deprecated Use createBulkAssinaturas instead
 */
export async function createMultipleAssinaturas(data: {
    participanteId: number;
    assinaturas: Array<{
        streamingId: number;
        frequencia: FrequenciaPagamento;
        valor: number;
    }>;
    dataInicio: string;
    cobrancaAutomaticaPaga?: boolean;
}) {
    return createBulkAssinaturas({
        participanteIds: [data.participanteId],
        assinaturas: data.assinaturas,
        dataInicio: data.dataInicio,
        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga
    });
}

/**
 * Create multiple subscriptions for MULTIPLE participants at once
 * M participants * N streamings = M*N subscriptions
 */
export async function createBulkAssinaturas(data: {
    participanteIds: number[];
    assinaturas: Array<{
        streamingId: number;
        frequencia: FrequenciaPagamento;
        valor: number;
    }>;
    dataInicio: string;
    cobrancaAutomaticaPaga?: boolean;
}) {
    const { contaId } = await getContext();

    if (!data.assinaturas || data.assinaturas.length === 0) {
        throw new Error("Selecione pelo menos um streaming");
    }
    if (!data.participanteIds || data.participanteIds.length === 0) {
        throw new Error("Selecione pelo menos um participante");
    }

    const dataInicio = new Date(data.dataInicio);
    const results: Array<{ streamingId: number; assinaturaId: number; participanteId: number }> = [];

    // Use transaction for atomicity - all or nothing
    await prisma.$transaction(async (tx) => {
        // Pre-validate streamings once
        const validStreamings = new Map();
        for (const ass of data.assinaturas) {
            if (validStreamings.has(ass.streamingId)) continue;

            const streaming = await tx.streaming.findUnique({
                where: { id: ass.streamingId },
                include: {
                    catalogo: true,
                    _count: {
                        select: {
                            assinaturas: {
                                where: {
                                    status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa] }
                                }
                            }
                        }
                    }
                }
            });

            if (!streaming) throw new Error(`Streaming ID ${ass.streamingId} não encontrado`);
            if (streaming.contaId !== contaId) throw new Error(`Você não tem permissão para usar ${streaming.catalogo.nome}`);
            validStreamings.set(ass.streamingId, streaming);
        }

        // Calculate total slots needed per streaming
        const participantesCount = data.participanteIds.length;
        for (const ass of data.assinaturas) {
            const streaming = validStreamings.get(ass.streamingId);
            const assinaturasAtivas = streaming._count.assinaturas;
            // Note: This simple check assumes this transaction is the only one adding, 
            // but effectively we need to check if we have enough slots for ALL participants.
            // However, since we are iterating, we will check incrementally or subtract total.
            // Let's check total capacity needed:
            if (assinaturasAtivas + participantesCount > streaming.limiteParticipantes) {
                throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes. Necessário ${participantesCount}, Disponível ${streaming.limiteParticipantes - assinaturasAtivas}`);
            }
        }

        // Iterate participants
        for (const participanteId of data.participanteIds) {
            // Iterate subscriptions
            for (const ass of data.assinaturas) {
                const streaming = validStreamings.get(ass.streamingId);

                // Note: We already checked capacity in bulk above, but concurrency could be an issue if high traffic.
                // For this app scale, the bulk check above is likely sufficient.
                // Check if user already has it
                const existing = await tx.assinatura.findFirst({
                    where: {
                        participanteId: participanteId,
                        streamingId: ass.streamingId,
                        NOT: {
                            status: StatusAssinatura.cancelada
                        }
                    }
                });

                if (existing) {
                    // Get participant name for better error
                    const p = await tx.participante.findUnique({ where: { id: participanteId }, select: { nome: true } });
                    throw new Error(`${p?.nome || 'Participante'} já possui assinatura ativa em ${streaming.apelido || streaming.catalogo.nome}`);
                }

                // Create subscription
                const assinatura = await tx.assinatura.create({
                    data: {
                        participanteId: participanteId,
                        streamingId: ass.streamingId,
                        frequencia: ass.frequencia,
                        valor: ass.valor,
                        dataInicio: dataInicio,
                        status: StatusAssinatura.ativa,
                        diasAtraso: 0,
                        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                    }
                });

                results.push({
                    streamingId: ass.streamingId,
                    assinaturaId: assinatura.id,
                    participanteId: participanteId
                });
            }
        }
    });

    // Generate charges for all created subscriptions (outside transaction)
    // We can do this with Promise.all for speed since they are independent
    await Promise.all(results.map(async (result) => {
        try {
            await criarCobrancaInicial(result.assinaturaId);
        } catch (error) {
            console.error(`Failed to create charge for subscription ${result.assinaturaId}:`, error);
        }
    }));

    revalidatePath("/assinaturas");
    revalidatePath("/cobrancas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");

    return {
        created: results.length,
        assinaturas: results
    };
}

/**
 * Cancel a subscription
 * Only active or suspended subscriptions can be cancelled
 */
export async function cancelarAssinatura(assinaturaId: number) {
    const { contaId } = await getContext();

    // Validate subscription exists and belongs to user's account
    const assinatura = await prisma.assinatura.findUnique({
        where: { id: assinaturaId },
        include: {
            participante: {
                select: {
                    id: true,
                    nome: true,
                    contaId: true,
                    whatsappNumero: true
                }
            },
            streaming: {
                include: {
                    catalogo: true
                }
            }
        }
    });

    if (!assinatura) {
        throw new Error("Assinatura não encontrada");
    }

    if (assinatura.participante.contaId !== contaId) {
        throw new Error("Você não tem permissão para cancelar esta assinatura");
    }

    // Validate current status
    if (assinatura.status === StatusAssinatura.cancelada) {
        throw new Error("Esta assinatura já está cancelada");
    }

    if (assinatura.status !== StatusAssinatura.ativa && assinatura.status !== StatusAssinatura.suspensa) {
        throw new Error("Apenas assinaturas ativas ou suspensas podem ser canceladas");
    }

    // Update subscription status to cancelled
    const updatedAssinatura = await prisma.assinatura.update({
        where: { id: assinaturaId },
        data: {
            status: StatusAssinatura.cancelada,
            dataCancelamento: new Date(),
            updatedAt: new Date()
        }
    });

    // Send WhatsApp notification (non-blocking)
    try {
        const { sendWhatsAppNotification, whatsappTemplates } = await import("@/lib/whatsapp-service");

        const mensagem = `🚫 *Assinatura Cancelada*\n\nOlá ${assinatura.participante.nome},\n\nSua assinatura de *${assinatura.streaming.catalogo.nome}* foi cancelada.\n\nSe você tiver alguma dúvida, entre em contato conosco.`;

        await sendWhatsAppNotification(
            contaId,
            "assinatura_suspensa", // Reusing existing type as closest match
            assinatura.participante.id,
            mensagem
        );
    } catch (error) {
        console.error("Erro ao enviar notificação WhatsApp:", error);
    }

    // Revalidate all relevant paths
    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");
    revalidatePath("/cobrancas");

    return updatedAssinatura;
}
