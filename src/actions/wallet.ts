"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { TipoChavePix } from "@prisma/client";
import { walletService } from "@/services/wallet-service";

export async function getWalletData() {
    try {
        const { contaId } = await getContext();

        const wallet = await prisma.wallet.findUnique({
            where: { contaId },
            include: {
                transacoes: {
                    orderBy: { createdAt: "desc" },
                    take: 50
                },
                saques: {
                    orderBy: { createdAt: "desc" },
                    take: 20
                }
            }
        });

        if (!wallet) {
            return {
                success: true,
                data: {
                    saldoDisponivel: 0,
                    saldoPendente: 0,
                    chavePixSaque: null,
                    tipoChavePix: null,
                    transacoes: [],
                    saques: []
                }
            };
        }

        return { success: true, data: wallet };
    } catch (error) {
        console.error("[GET_WALLET_DATA_ERROR]", error);
        return { success: false, error: "Erro ao buscar dados da carteira." };
    }
}

export async function solicitarSaque(valor: number) {
    try {
        const { contaId } = await getContext();

        if (valor < 10) {
            return { success: false, error: "O valor mínimo para saque é R$ 10,00." };
        }

        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { contaId }
            });

            if (!wallet) return { success: false, error: "Carteira não encontrada." };
            if (!wallet.chavePixSaque || !wallet.tipoChavePix) {
                return { success: false, error: "Chave PIX não configurada." };
            }

            const saldoDisponivel = Number(wallet.saldoDisponivel);

            if (saldoDisponivel < valor) {
                return { success: false, error: "Saldo insuficiente para o saque solicitado." };
            }

            // Usar o service para garantir consistência do ledger e atomicidade
            const saque = await walletService.solicitarSaque(tx, {
                walletId: wallet.id,
                valor,
                chavePixDestino: wallet.chavePixSaque,
                tipoChaveDestino: wallet.tipoChavePix
            });

            return { success: true, data: saque };
        });

        return result;
    } catch (error) {
        console.error("[SOLICITAR_SAQUE_ERROR]", error);
        return { success: false, error: "Erro ao solicitar saque." };
    }
}

export async function salvarChavePix(chavePix: string, tipoChave: string) {
    try {
        const { contaId } = await getContext();

        if (!chavePix || !tipoChave) {
            return { success: false, error: "Chave PIX e tipo são obrigatórios." };
        }

        const tipoValido = Object.values(TipoChavePix).includes(tipoChave as TipoChavePix);
        if (!tipoValido) {
            return { success: false, error: "Tipo de chave PIX inválido." };
        }

        await prisma.wallet.upsert({
            where: { contaId },
            create: {
                contaId,
                chavePixSaque: chavePix,
                tipoChavePix: tipoChave as TipoChavePix
            },
            update: {
                chavePixSaque: chavePix,
                tipoChavePix: tipoChave as TipoChavePix
            }
        });

        return { success: true, message: "Chave PIX salva com sucesso." };
    } catch (error) {
        console.error("[SALVAR_CHAVE_PIX_ERROR]", error);
        return { success: false, error: "Erro ao salvar a chave PIX." };
    }
}
