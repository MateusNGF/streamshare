"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { TransactionStatus } from "@prisma/client";
import { walletService } from "@/services/wallet-service";

async function isSuperAdmin(usuarioId: number) {
    const admin = await prisma.usuarioAdmin.findUnique({
        where: { usuarioId }
    });
    return !!admin && admin.isAtivo;
}

export async function listarSaquesPendentes() {
    try {
        const { usuarioId } = await getContext();

        if (!(await isSuperAdmin(usuarioId))) {
            return { success: false, error: "Acesso não autorizado." };
        }

        const saques = await prisma.saque.findMany({
            where: {
                status: 'PENDENTE'
            },
            include: {
                wallet: {
                    include: {
                        conta: {
                            select: { nome: true, email: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return { success: true, data: saques };
    } catch (error) {
        console.error("[LISTAR_SAQUES_ERROR]", error);
        return { success: false, error: "Erro ao listar saques." };
    }
}

export async function aprovarSaque(saqueId: number, comprovanteUrl: string, transferenciaMpId?: string) {
    try {
        const { usuarioId } = await getContext();

        if (!(await isSuperAdmin(usuarioId))) {
            return { success: false, error: "Acesso não autorizado." };
        }

        const result = await prisma.$transaction(async (tx) => {
            const saque = await tx.saque.findUnique({
                where: { id: saqueId }
            });

            if (!saque || saque.status !== 'PENDENTE') {
                return { success: false, error: "Saque não encontrado ou não está pendente." };
            }

            const updatedSaque = await walletService.aprovarSaque(tx, {
                saqueId,
                adminId: usuarioId,
                comprovanteUrl,
                transferenciaMpId
            });

            return { success: true, data: updatedSaque };
        });

        return result;
    } catch (error) {
        console.error("[APROVAR_SAQUE_ERROR]", error);
        return { success: false, error: "Erro ao aprovar saque." };
    }
}

export async function rejeitarSaque(saqueId: number, motivoRejeicao: string) {
    try {
        const { usuarioId } = await getContext();

        if (!(await isSuperAdmin(usuarioId))) {
            return { success: false, error: "Acesso não autorizado." };
        }

        const result = await prisma.$transaction(async (tx) => {
            const saque = await tx.saque.findUnique({
                where: { id: saqueId }
            });

            if (!saque || saque.status !== 'PENDENTE') {
                return { success: false, error: "Saque não encontrado ou não está pendente." };
            }

            await walletService.rejeitarSaque(tx, {
                saqueId,
                adminId: usuarioId,
                motivoRejeicao
            });

            return { success: true };
        });

        return result;
    } catch (error) {
        console.error("[REJEITAR_SAQUE_ERROR]", error);
        return { success: false, error: "Erro ao rejeitar saque." };
    }
}

export async function getConciliacaoFinanceira() {
    try {
        const { usuarioId } = await getContext();

        if (!(await isSuperAdmin(usuarioId))) {
            return { success: false, error: "Acesso não autorizado." };
        }

        // Soma total de saldo disponível de todas as wallets
        const agg = await prisma.wallet.aggregate({
            _sum: {
                saldoDisponivel: true,
                saldoPendente: true
            }
        });

        return {
            success: true,
            data: {
                totalDisponivel: agg._sum.saldoDisponivel?.toNumber() || 0,
                totalPendente: agg._sum.saldoPendente?.toNumber() || 0
            }
        };
    } catch (error) {
        console.error("[GET_CONCILIACAO_ERROR]", error);
        return { success: false, error: "Erro ao carregar conciliação financeira." };
    }
}
