"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

export async function getParticipantes() {
    const { contaId } = await getContext();

    return prisma.participante.findMany({
        where: { contaId },
        include: {
            _count: {
                select: { assinaturas: true },
            },
        },
        orderBy: { nome: "asc" },
    });
}

export async function createParticipante(data: {
    nome: string;
    whatsappNumero: string;
    cpf: string;
    email?: string;
}) {
    const { contaId } = await getContext();

    const participante = await prisma.participante.create({
        data: {
            ...data,
            contaId,
        },
    });

    revalidatePath("/participantes");
    return participante;
}

export async function updateParticipante(
    id: number,
    data: {
        nome: string;
        whatsappNumero: string;
        cpf: string;
        email?: string;
    }
) {
    const { contaId } = await getContext();

    const participante = await prisma.participante.update({
        where: { id, contaId },
        data,
    });

    revalidatePath("/participantes");
    return participante;
}

export async function deleteParticipante(id: number) {
    const { contaId } = await getContext();

    await prisma.participante.delete({
        where: { id, contaId },
    });

    revalidatePath("/participantes");
}
