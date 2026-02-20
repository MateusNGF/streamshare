"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { criarNotificacao } from "@/actions/notificacoes";

import { getContext } from "@/lib/action-context";

export async function getSettingsData() {
    try {
        const session = await getCurrentUser();
        if (!session) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

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
                        gatewaySubscriptionStatus: true,
                        gatewayCancelAtPeriodEnd: true,
                        createdAt: true,
                        isAtivo: true,
                        _count: {
                            select: {
                                grupos: true,
                                streamings: true,
                                participantes: true,
                            },
                        },
                        wallet: {
                            select: {
                                chavePixSaque: true,
                                tipoChavePix: true
                            }
                        }
                    },
                },
            },
        });

        const data = {
            user,
            conta: userAccount?.conta,
        };

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_SETTINGS_DATA_ERROR]", error);
        return { success: false, error: "Erro ao buscar dados de configurações" };
    }
}

export async function updateProfile(data: { nome: string; email: string; whatsapp?: string }) {
    try {
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
        return { success: true };
    } catch (error: any) {
        console.error("[UPDATE_PROFILE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar perfil" };
    }
}

export async function updateAccount(data: { nome: string; email: string; chavePix?: string; tipoChavePix?: string }) {
    try {
        const { contaId, userId } = await getContext();

        // Validar email se fornecido
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return { success: false, error: "Formato de email inválido" };
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
                    chavePix: data.chavePix, // Mantendo por retrocompatibilidade temporariamente
                },
            });

            if (data.tipoChavePix) {
                await tx.wallet.upsert({
                    where: { contaId },
                    create: {
                        contaId,
                        chavePixSaque: data.chavePix,
                        tipoChavePix: data.tipoChavePix as any
                    },
                    update: {
                        chavePixSaque: data.chavePix,
                        tipoChavePix: data.tipoChavePix as any
                    }
                });
            }

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
        return { success: true };
    } catch (error: any) {
        console.error("[UPDATE_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar conta" };
    }
}

import { getSupportedCurrencyCodes } from "@/types/currency.types";

export async function updateCurrency(currencyCode: string) {
    try {
        const { contaId, userId } = await getContext();

        // Validar código de moeda
        const validCurrencies = getSupportedCurrencyCodes();
        if (!validCurrencies.includes(currencyCode as any)) {
            return { success: false, error: 'Código de moeda inválido' };
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
        return { success: true };
    } catch (error: any) {
        console.error("[UPDATE_CURRENCY_ERROR]", error);
        return { success: false, error: "Erro ao atualizar moeda" };
    }
}

