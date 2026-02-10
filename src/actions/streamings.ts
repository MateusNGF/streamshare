"use server";

import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";
import { StreamingSchema } from "@/lib/schemas";
import { PLANS } from "@/config/plans";
import { criarNotificacao } from "@/actions/notificacoes";
import { getContext } from "@/lib/action-context";

export async function getCatalogos() {
    return prisma.streamingCatalogo.findMany({
        where: { isAtivo: true },
        orderBy: { nome: "asc" },
    });
}

export async function createCatalogoItem(data: {
    nome: string;
    iconeUrl?: string;
    corPrimaria?: string;
}) {
    const { nivelAcesso } = await getContext();
    if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
        throw new Error("Acesso negado");
    }

    const item = await prisma.streamingCatalogo.create({
        data: {
            nome: data.nome,
            iconeUrl: data.iconeUrl,
            corPrimaria: data.corPrimaria || "#000000",
            isAtivo: true,
        },
    });

    revalidatePath("/admin/catalogo");
    revalidatePath("/streamings");
    return item;
}

export async function updateCatalogoItem(
    id: number,
    data: {
        nome?: string;
        iconeUrl?: string;
        corPrimaria?: string;
        isAtivo?: boolean;
    }
) {
    const { nivelAcesso } = await getContext();
    if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
        throw new Error("Acesso negado");
    }

    const item = await prisma.streamingCatalogo.update({
        where: { id },
        data: {
            ...data,
        },
    });

    revalidatePath("/admin/catalogo");
    revalidatePath("/streamings");
    return item;
}

export async function deleteCatalogoItem(id: number) {
    const { nivelAcesso } = await getContext();
    if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
        throw new Error("Acesso negado");
    }

    // Soft delete
    await prisma.streamingCatalogo.update({
        where: { id },
        data: { isAtivo: false },
    });

    revalidatePath("/admin/catalogo");
    revalidatePath("/streamings");
}

export async function getStreamings() {
    const { contaId } = await getContext();

    const streamings = await prisma.streaming.findMany({
        where: { contaId },
        include: {
            catalogo: true,
            _count: {
                select: {
                    assinaturas: {
                        where: {
                            status: { not: "cancelada" }
                        }
                    }
                }
            }
        },
        orderBy: [
            { apelido: "asc" },
            { catalogo: { nome: "asc" } }
        ]
    });

    return streamings.map(s => ({
        ...s,
        valorIntegral: s.valorIntegral.toNumber()
    }));
}

export async function getNextStreamingNumber(catalogoId: number) {
    const { contaId } = await getContext();

    const count = await prisma.streaming.count({
        where: {
            contaId,
            streamingCatalogoId: catalogoId
        }
    });

    return count + 1;
}

/**
 * Get the count of active subscriptions for a streaming
 */
export async function getActiveSubscriptionsCount(streamingId: number) {
    const { contaId } = await getContext();

    const count = await prisma.assinatura.count({
        where: {
            streamingId,
            streaming: { contaId },
            status: { in: ["ativa", "suspensa"] }
        }
    });

    return count;
}

/**
 * Update the value of all existing active subscriptions for a streaming
 */
export async function updateExistingSubscriptionValues(streamingId: number, newValue: number) {
    const { contaId } = await getContext();

    const updated = await prisma.assinatura.updateMany({
        where: {
            streamingId,
            streaming: { contaId },
            status: { in: ["ativa", "suspensa"] }
        },
        data: {
            valor: newValue
        }
    });

    revalidatePath("/assinaturas");
    revalidatePath("/cobrancas");
    return updated.count;
}

export async function createStreaming(data: {
    catalogoId: number;
    apelido: string;
    valorIntegral: number;
    limiteParticipantes: number;
}) {


    // ... inside createStreaming ...

    const { contaId } = await getContext();

    // 1. Fetch Account and Plan
    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { plano: true }
    });

    if (!conta) throw new Error("Conta não encontrada");

    const planConfig = PLANS[conta.plano];

    // 2. Validate Streaming Count Limit
    const currentStreamingsCount = await prisma.streaming.count({
        where: { contaId }
    });

    if (currentStreamingsCount >= planConfig.maxStreamings) {
        throw new Error(
            `Seu plano (${planConfig.label}) permite apenas ${planConfig.maxStreamings} streaming(s). ` +
            `Atualize para o plano PRO para ter acesso ilimitado.`
        );
    }

    // 3. Validate Participants Limit
    if (data.limiteParticipantes > planConfig.maxParticipantes) {
        throw new Error(
            `Seu plano (${planConfig.label}) permite no máximo ${planConfig.maxParticipantes} participantes por streaming.`
        );
    }

    // Business validations
    // Business validations using Zod
    const validatedData = StreamingSchema.parse({
        ...data,
        catalogoId: String(data.catalogoId)
    });

    if (validatedData.limiteParticipantes > 100) {
        throw new Error("Limite de participantes não pode exceder 100");
    }

    // Validate catalog exists and is active
    const catalogo = await prisma.streamingCatalogo.findUnique({
        where: { id: data.catalogoId }
    });

    if (!catalogo) {
        throw new Error("Catálogo de streaming não encontrado");
    }

    if (!catalogo.isAtivo) {
        throw new Error("Este catálogo de streaming não está mais disponível");
    }

    // Note: Duplicate catalog check removed - multiple instances allowed with different names

    const streaming = await prisma.streaming.create({
        data: {
            contaId,
            streamingCatalogoId: data.catalogoId,
            apelido: data.apelido.trim(),
            valorIntegral: data.valorIntegral,
            limiteParticipantes: data.limiteParticipantes,
        },
        include: {
            catalogo: true,
            _count: {
                select: {
                    assinaturas: {
                        where: {
                            status: { not: "cancelada" }
                        }
                    }
                }
            }
        }
    });

    // Create notification
    await criarNotificacao({
        tipo: "streaming_criado",
        titulo: `Streaming adicionado`,
        descricao: `${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''} foi adicionado ao sistema.`,
        entidadeId: streaming.id
    });

    revalidatePath("/streamings");
    return {
        ...streaming,
        valorIntegral: streaming.valorIntegral.toNumber()
    };
}

export async function updateStreaming(
    id: number,
    data: {
        catalogoId: number;
        apelido: string;
        valorIntegral: number;
        limiteParticipantes: number;
        updateExistingSubscriptions?: boolean; // Optional: update existing subscription values
    }
) {
    const { contaId } = await getContext();

    // Business validations
    // Business validations using Zod
    const validatedData = StreamingSchema.parse({
        ...data,
        catalogoId: String(data.catalogoId)
    });

    if (validatedData.limiteParticipantes > 100) {
        throw new Error("Limite de participantes não pode exceder 100");
    }

    // Get current streaming data
    const currentStreaming = await prisma.streaming.findUnique({
        where: { id, contaId },
        include: {
            _count: {
                select: {
                    assinaturas: {
                        where: { status: { in: ["ativa", "suspensa"] } }
                    }
                }
            }
        }
    });

    if (!currentStreaming) {
        throw new Error("Streaming não encontrado");
    }

    const activeSubscriptionsCount = currentStreaming._count.assinaturas;

    // VALIDATION: Prevent reducing participant limit below active subscriptions
    if (data.limiteParticipantes < activeSubscriptionsCount) {
        throw new Error(
            `Não é possível reduzir o limite para ${data.limiteParticipantes}. ` +
            `Existem ${activeSubscriptionsCount} assinatura(s) ativa(s). ` +
            `Cancele ${activeSubscriptionsCount - data.limiteParticipantes} assinatura(s) antes de prosseguir.`
        );
    }

    const valueChanged = currentStreaming.valorIntegral.toString() !== data.valorIntegral.toString();
    const shouldUpdateSubscriptions = valueChanged && data.updateExistingSubscriptions && activeSubscriptionsCount > 0;

    // If not updating subscriptions, just update the streaming
    if (!shouldUpdateSubscriptions) {
        const streaming = await prisma.streaming.update({
            where: { id, contaId },
            data: {
                streamingCatalogoId: data.catalogoId,
                apelido: data.apelido.trim(),
                valorIntegral: data.valorIntegral,
                limiteParticipantes: data.limiteParticipantes,
            },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { not: "cancelada" }
                            }
                        }
                    }
                }
            }
        });

        // Create notification
        await criarNotificacao({
            tipo: "streaming_editado",
            titulo: `Streaming atualizado`,
            descricao: `As informações de ${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''} foram atualizadas.`,
            entidadeId: streaming.id
        });

        revalidatePath("/streamings");
        revalidatePath("/assinaturas");
        return {
            streaming: {
                ...streaming,
                valorIntegral: streaming.valorIntegral.toNumber()
            },
            updatedSubscriptions: 0
        };
    }

    // Use transaction when updating both streaming and subscriptions atomically
    const result = await prisma.$transaction(async (tx) => {
        const streaming = await tx.streaming.update({
            where: { id, contaId },
            data: {
                streamingCatalogoId: data.catalogoId,
                apelido: data.apelido.trim(),
                valorIntegral: data.valorIntegral,
                limiteParticipantes: data.limiteParticipantes,
            },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { not: "cancelada" }
                            }
                        }
                    }
                }
            }
        });

        const updated = await tx.assinatura.updateMany({
            where: {
                streamingId: id,
                streaming: { contaId },
                status: { in: ["ativa", "suspensa"] }
            },
            data: {
                valor: data.valorIntegral
            }
        });

        return { streaming, updatedCount: updated.count };
    });

    // Create notification
    await criarNotificacao({
        tipo: "streaming_editado",
        titulo: `Streaming atualizado`,
        descricao: `As informações do streaming foram atualizadas${result.updatedCount > 0 ? ` e ${result.updatedCount} assinatura(s) ajustada(s)` : ''}.`,
        entidadeId: id
    });

    revalidatePath("/streamings");
    revalidatePath("/assinaturas");
    return {
        streaming: {
            ...result.streaming,
            valorIntegral: result.streaming.valorIntegral.toNumber()
        },
        updatedSubscriptions: result.updatedCount
    };
}

export async function deleteStreaming(id: number) {
    const { contaId } = await getContext();

    // Use transaction to validate and delete atomically
    await prisma.$transaction(async (tx) => {
        // Check for active/suspended subscriptions
        const activeSubscriptions = await tx.assinatura.count({
            where: {
                streamingId: id,
                status: { in: ["ativa", "suspensa"] }
            }
        });

        if (activeSubscriptions > 0) {
            throw new Error(
                `Não é possível deletar este streaming. ` +
                `Existem ${activeSubscriptions} assinatura(s) ativa(s). ` +
                `Cancele todas as assinaturas antes de prosseguir.`
            );
        }

        // Get streaming name before deleting
        const streaming = await tx.streaming.findUnique({
            where: { id, contaId },
            include: { catalogo: true }
        });

        if (!streaming) {
            throw new Error("Streaming não encontrado");
        }

        // Delete the streaming
        await tx.streaming.delete({
            where: { id, contaId },
        });

        return `${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''}`;
    });

    // Create notification
    const streamingName = await prisma.$transaction(async (tx) => {
        const s = await tx.streaming.findUnique({
            where: { id },
            include: { catalogo: true }
        });
        return s ? `${s.catalogo.nome}${s.apelido ? ` (${s.apelido})` : ''}` : null;
    }).catch(() => null);

    await criarNotificacao({
        tipo: "streaming_excluido",
        titulo: `Streaming removido`,
        descricao: streamingName ? `${streamingName} foi removido do sistema.` : "Um streaming foi removido do sistema.",
        entidadeId: id
    });

    revalidatePath("/streamings");
}
