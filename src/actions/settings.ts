"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { criarNotificacao } from "@/actions/notificacoes";

import { getContext } from "@/lib/action-context";

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

                    moedaPreferencia: true,
                    chavePix: true,
                    stripeSubscriptionStatus: true,
                    stripeCancelAtPeriodEnd: true,
                    createdAt: true,
                    isAtivo: true,
                    _count: {
                        select: {
                            grupos: true,
                            streamings: true,
                            participantes: true,
                        },
                    },
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
    const { userId, contaId } = await getContext();

    await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
            where: { id: userId },
            data: {
                nome: data.nome,
                email: data.email,
                whatsapp: data.whatsapp,
            },
        });

        // Create notification inside transaction
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: userId,
                tipo: "configuracao_alterada",
                titulo: `Perfil atualizado`,
                descricao: `As informações do seu perfil foram atualizadas.`,
                lida: false
            }
        });
    });

    revalidatePath("/configuracoes");
}

export async function updateAccount(data: { nome: string; email: string; chavePix?: string }) {
    const { contaId, userId } = await getContext();

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

        // Create notification inside transaction (Broadcast to Admins)
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: null,
                tipo: "configuracao_alterada",
                titulo: `Conta atualizada`,
                descricao: `As informações da conta foram atualizadas por um administrador.`,
                lida: false
            }
        });
    });

    revalidatePath("/configuracoes");
}

import { getSupportedCurrencyCodes } from "@/types/currency.types";

export async function updateCurrency(currencyCode: string) {
    const { contaId, userId } = await getContext();

    // Validar código de moeda
    const validCurrencies = getSupportedCurrencyCodes();
    if (!validCurrencies.includes(currencyCode as any)) {
        throw new Error('Código de moeda inválido');
    }

    await prisma.$transaction(async (tx) => {
        await tx.conta.update({
            where: { id: contaId },
            data: { moedaPreferencia: currencyCode },
        });

        // Create notification inside transaction (Broadcast to Admins)
        await tx.notificacao.create({
            data: {
                contaId,
                usuarioId: null,
                tipo: "configuracao_alterada",
                titulo: `Moeda atualizada`,
                descricao: `A moeda preferencial foi alterada para ${currencyCode}.`,
                lida: false
            }
        });
    });

    revalidatePath('/configuracoes');
}

