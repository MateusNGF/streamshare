"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true, nivelAcesso: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId, nivelAcesso: userAccount.nivelAcesso };
}

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

    return prisma.streaming.findMany({
        where: { contaId },
        include: {
            catalogo: true,
            _count: {
                select: { assinaturas: true }
            }
        },
        orderBy: { catalogo: { nome: "asc" } },
    });
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
    valorIntegral: number;
    limiteParticipantes: number;
}) {
    const { contaId } = await getContext();

    // Ensure dataVencimento is a valid date object or null if empty string

    const streaming = await prisma.streaming.create({
        data: {
            contaId,
            streamingCatalogoId: data.catalogoId,
            valorIntegral: data.valorIntegral,
            limiteParticipantes: data.limiteParticipantes,
            // frequenciasHabilitadas default is set by schema
        },
    });

    revalidatePath("/streamings");
    return streaming;
}

export async function updateStreaming(
    id: number,
    data: {
        catalogoId: number;
        valorIntegral: number;
        limiteParticipantes: number;
        updateExistingSubscriptions?: boolean; // Optional: update existing subscription values
    }
) {
    const { contaId } = await getContext();

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

    // Update the streaming
    const streaming = await prisma.streaming.update({
        where: { id, contaId },
        data: {
            streamingCatalogoId: data.catalogoId,
            valorIntegral: data.valorIntegral,
            limiteParticipantes: data.limiteParticipantes,
        },
    });

    // If value changed and flag is set, update existing subscriptions
    const valueChanged = currentStreaming.valorIntegral.toString() !== data.valorIntegral.toString();
    if (valueChanged && data.updateExistingSubscriptions && activeSubscriptionsCount > 0) {
        await updateExistingSubscriptionValues(id, data.valorIntegral);
    }

    revalidatePath("/streamings");
    revalidatePath("/assinaturas");
    return {
        streaming,
        updatedSubscriptions: (valueChanged && data.updateExistingSubscriptions) ? activeSubscriptionsCount : 0
    };
}

export async function deleteStreaming(id: number) {
    const { contaId } = await getContext();

    await prisma.streaming.delete({
        where: { id, contaId },
    });

    revalidatePath("/streamings");
}
