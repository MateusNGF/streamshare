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

export async function createStreaming(data: {
    catalogoId: number;
    valorIntegral: number;
    limiteParticipantes: number;
    dataVencimento: string;
}) {
    const { contaId } = await getContext();

    // Ensure dataVencimento is a valid date object or null if empty string
    const dataVencimento = data.dataVencimento ? new Date(data.dataVencimento) : null;
    if (dataVencimento && isNaN(dataVencimento.getTime())) {
        throw new Error("Data de vencimento inválida");
    }

    const streaming = await prisma.streaming.create({
        data: {
            contaId,
            streamingCatalogoId: data.catalogoId,
            valorIntegral: data.valorIntegral,
            limiteParticipantes: data.limiteParticipantes,
            dataVencimento,
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
        dataVencimento?: string;
    }
) {
    const { contaId } = await getContext();

    const streaming = await prisma.streaming.update({
        where: { id, contaId },
        data: {
            streamingCatalogoId: data.catalogoId,
            valorIntegral: data.valorIntegral,
            limiteParticipantes: data.limiteParticipantes,
            dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : null,
        },
    });

    revalidatePath("/streamings");
    return streaming;
}

export async function deleteStreaming(id: number) {
    const { contaId } = await getContext();

    await prisma.streaming.delete({
        where: { id, contaId },
    });

    revalidatePath("/streamings");
}
