"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        include: { conta: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId, conta: userAccount.conta };
}

export async function getSettingsData() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const user = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: { nome: true, email: true },
    });

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        include: { conta: true },
    });

    return {
        user,
        conta: userAccount?.conta,
    };
}

export async function updateProfile(data: { nome: string; email: string }) {
    const { userId } = await getContext();

    await prisma.usuario.update({
        where: { id: userId },
        data: {
            nome: data.nome,
            email: data.email,
        },
    });

    revalidatePath("/configuracoes");
}

export async function updateAccount(data: { nome: string; email: string }) {
    const { contaId } = await getContext();

    // Validar email se fornecido
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error("Formato de email inválido");
        }

        // Verificar duplicata
        const existingAccount = await prisma.conta.findFirst({
            where: {
                email: data.email,
                id: { not: contaId },
            },
        });

        if (existingAccount) {
            throw new Error("Este email já está em uso por outra conta");
        }
    }

    await prisma.conta.update({
        where: { id: contaId },
        data: {
            nome: data.nome,
            email: data.email,
        },
    });

    revalidatePath("/configuracoes");
}

