"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { criarNotificacao } from "@/actions/notificacoes";

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
        select: { nome: true, email: true, whatsapp: true },
    });

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        include: {
            conta: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    plano: true,
                    limiteGrupos: true,
                    moedaPreferencia: true,
                    chavePix: true,
                },
            },
        },
    });

    return {
        user,
        conta: userAccount?.conta,
    };
}

export async function updateProfile(data: { nome: string; email: string; whatsapp?: string }) {
    const { userId } = await getContext();

    await prisma.usuario.update({
        where: { id: userId },
        data: {
            nome: data.nome,
            email: data.email,
            whatsapp: data.whatsapp,
        },
    });

    // Create notification
    await criarNotificacao({
        tipo: "configuracao_alterada",
        titulo: `Perfil atualizado`,
        descricao: `As informações do seu perfil foram atualizadas.`
    });

    revalidatePath("/configuracoes");
}

export async function updateAccount(data: { nome: string; email: string; chavePix?: string }) {
    const { contaId } = await getContext();

    // Validar email se fornecido
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error("Formato de email inválido");
        }
    }

    // Use transaction to check and update atomically (prevents race condition)
    await prisma.$transaction(async (tx) => {
        if (data.email) {
            // Verificar duplicata
            const existingAccount = await tx.conta.findFirst({
                where: {
                    email: data.email,
                    id: { not: contaId },
                },
            });

            if (existingAccount) {
                throw new Error("Este email já está em uso por outra conta");
            }
        }

        await tx.conta.update({
            where: { id: contaId },
            data: {
                nome: data.nome,
                email: data.email,
                chavePix: data.chavePix,
            },
        });
    });

    // Create notification
    await criarNotificacao({
        tipo: "configuracao_alterada",
        titulo: `Conta atualizada`,
        descricao: `As informações da conta foram atualizadas.`
    });

    revalidatePath("/configuracoes");
}

import { getSupportedCurrencyCodes } from "@/types/currency.types";

export async function updateCurrency(currencyCode: string) {
    const { contaId } = await getContext();

    // Validar código de moeda
    const validCurrencies = getSupportedCurrencyCodes();
    if (!validCurrencies.includes(currencyCode as any)) {
        throw new Error('Código de moeda inválido');
    }

    await prisma.conta.update({
        where: { id: contaId },
        data: { moedaPreferencia: currencyCode },
    });

    // Create notification
    await criarNotificacao({
        tipo: "configuracao_alterada",
        titulo: `Moeda atualizada`,
        descricao: `A moeda preferencial foi alterada para ${currencyCode}.`
    });

    revalidatePath('/configuracoes');
}

