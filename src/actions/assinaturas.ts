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

export async function getAssinaturas() {
    const { contaId } = await getContext();

    return prisma.assinatura.findMany({
        where: {
            participante: { contaId },
        },
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
        const valorCobranca = calcularValorPeriodo(new (await import("@prisma/client")).Prisma.Decimal(data.valor), data.frequencia);

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

        if (result.participante && result.streaming) {
            const mensagem = whatsappTemplates.novaAssinatura(
                result.participante.nome,
                result.streaming.catalogo.nome,
                `R$ ${data.valor.toFixed(2)}`,
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
 * Create multiple subscriptions for one participant at once
 * Uses transaction to ensure all-or-nothing behavior
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
    const { contaId } = await getContext();

    if (!data.assinaturas || data.assinaturas.length === 0) {
        throw new Error("Selecione pelo menos um streaming");
    }

    const dataInicio = new Date(data.dataInicio);
    const results: Array<{ streamingId: number; assinaturaId: number }> = [];

    // Use transaction for atomicity - all or nothing
    await prisma.$transaction(async (tx) => {
        for (const ass of data.assinaturas) {
            // Validate streaming exists and get details
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

            if (!streaming) {
                throw new Error(`Streaming ID ${ass.streamingId} não encontrado`);
            }

            if (streaming.contaId !== contaId) {
                throw new Error(`Você não tem permissão para usar ${streaming.catalogo.nome}`);
            }

            // Check slot availability
            const assinaturasAtivas = streaming._count.assinaturas;
            if (assinaturasAtivas >= streaming.limiteParticipantes) {
                throw new Error(`${streaming.catalogo.nome}: Sem vagas disponíveis (${assinaturasAtivas}/${streaming.limiteParticipantes})`);
            }

            // Check for existing active/suspended subscription
            const existing = await tx.assinatura.findFirst({
                where: {
                    participanteId: data.participanteId,
                    streamingId: ass.streamingId,
                    NOT: {
                        status: StatusAssinatura.cancelada
                    }
                }
            });

            if (existing) {
                throw new Error(`Participante já possui assinatura ${existing.status} em ${streaming.apelido || streaming.catalogo.nome}`);
            }

            // Create subscription
            const assinatura = await tx.assinatura.create({
                data: {
                    participanteId: data.participanteId,
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
                assinaturaId: assinatura.id
            });
        }
    });

    // Generate charges for all created subscriptions (outside transaction)
    for (const result of results) {
        try {
            await criarCobrancaInicial(result.assinaturaId);
        } catch (error) {
            console.error(`Failed to create charge for subscription ${result.assinaturaId}:`, error);
            // Don't fail the entire operation if charge creation fails
        }
    }

    revalidatePath("/assinaturas");
    revalidatePath("/cobrancas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");

    return {
        created: results.length,
        assinaturas: results
    };
}
