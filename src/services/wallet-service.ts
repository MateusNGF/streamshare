import { prisma } from "@/lib/db";
import { TransactionType, TransactionStatus, TipoChavePix, MetodoPagamento, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * WalletService: Centralizes all Ledger logic (Wallet & WalletTransaction).
 * Follows ACID principles by requiring a Prisma Transaction (tx) for state-mutating operations.
 */
export const walletService = {
    /**
     * Ensures a wallet exists for a given account.
     */
    getOrCreateWallet: async (tx: any, contaId: number) => {
        return await tx.wallet.upsert({
            where: { contaId },
            create: { contaId },
            update: {},
        });
    },

    /**
     * Gets the platform fee percentage as a Decimal.
     * Centralized to keep DRY (SOLID).
     */
    getPlatformFeePercentage: async (tx: any): Promise<Decimal> => {
        const parametroTaxa = await tx.parametro.findUnique({ where: { chave: 'TAXA_PLATAFORMA_PERCENTUAL' } });
        return new Decimal(parametroTaxa ?? '2').div(100);
    },

    /**
     * Processes a received payment, crediting the admin and debiting the platform fee.
     * ACID: Must be run inside a transaction confirming the charge.
     */
    processPaymentCredit: async (tx: any, params: {
        contaId: number,
        valorPago: number,
        metodoPagamento: MetodoPagamento | string,
        referenciaGateway: string,
        cobrancaId: number,
        assinaturaId: number,
        participanteId: number
    }) => {
        const { contaId, valorPago, metodoPagamento, referenciaGateway, cobrancaId, assinaturaId, participanteId } = params;

        const wallet = await walletService.getOrCreateWallet(tx, contaId);

        // Idempotency Check: Don't process the same payment ID twice in the ledger
        const alreadyProcessed = await tx.walletTransaction.findFirst({
            where: { walletId: wallet.id, referenciaGateway }
        });

        if (alreadyProcessed) {
            console.info(`[WALLET_SERVICE] Payment ${referenciaGateway} already processed in Ledger. Skipping.`);
            return { skipped: true };
        }

        const feePercentage = await walletService.getPlatformFeePercentage(tx);
        const amountPaidDec = new Decimal(valorPago);

        const feeAmount = amountPaidDec.mul(feePercentage).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        const netAmount = amountPaidDec.minus(feeAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        // Logic: PIX is available immediately. Cards go to pending (clearing period).
        const balanceField = metodoPagamento === 'PIX' ? 'saldoDisponivel' : 'saldoPendente';

        // Update Balance
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { [balanceField]: { increment: netAmount } }
        });

        // Create Ledger Entry: Credit
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: netAmount,
                tipo: 'CREDITO_COTA',
                descricao: `Pagamento recebido: Assinatura #${assinaturaId}`,
                referenciaGateway,
                metadataJson: { cobrancaId, participanteId },
                isLiberado: metodoPagamento === 'PIX'
            }
        });

        // Create Ledger Entry: Platform Fee
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: feeAmount.negated(),
                tipo: 'DEBITO_TAXA',
                descricao: `Taxa de Intermediação (${feePercentage.mul(100).toNumber()}%) — Ref #${cobrancaId}`,
                referenciaGateway,
                isLiberado: true
            }
        });

        return { success: true, netAmount, feeAmount };
    },

    /**
     * Processes a payment refund, deducting the previously credited amount from the admin's wallet.
     * ACID: Must be run inside a transaction.
     */
    processPaymentRefund: async (tx: any, params: {
        contaId: number,
        valorPago: number,
        metodoPagamento: MetodoPagamento | string,
        referenciaGateway: string,
        cobrancaId: number,
        assinaturaId: number,
        participanteId: number
    }) => {
        const { contaId, valorPago, metodoPagamento, referenciaGateway, cobrancaId, assinaturaId, participanteId } = params;

        const wallet = await walletService.getOrCreateWallet(tx, contaId);

        // Idempotency: Don't process the same refund twice
        const alreadyRefunded = await tx.walletTransaction.findFirst({
            where: { walletId: wallet.id, tipo: 'ESTORNO', referenciaGateway, valor: { lt: 0 } }
        });

        if (alreadyRefunded) {
            console.info(`[WALLET_SERVICE] Refund ${referenciaGateway} already processed in Ledger. Skipping.`);
            return { skipped: true };
        }

        const feePercentage = await walletService.getPlatformFeePercentage(tx);
        const amountPaidDec = new Decimal(valorPago);

        const feeAmount = amountPaidDec.mul(feePercentage).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        const netAmount = amountPaidDec.minus(feeAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        const balanceField = metodoPagamento === 'PIX' ? 'saldoDisponivel' : 'saldoPendente';

        // Deduct Balance
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { [balanceField]: { decrement: netAmount } }
        });

        // Create Ledger Entry: Refund Debit
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: netAmount.negated(),
                tipo: 'ESTORNO',
                descricao: `Estorno de pagamento: Assinatura #${assinaturaId}`,
                referenciaGateway,
                metadataJson: { cobrancaId, participanteId, isRefund: true },
                isLiberado: metodoPagamento === 'PIX'
            }
        });

        // Create Ledger Entry: Platform Fee Reversal (Credit back the fee to balance out the initial fee debit)
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: feeAmount,
                tipo: 'ESTORNO',
                descricao: `Estorno da Taxa de Intermediação — Ref #${cobrancaId}`,
                referenciaGateway,
                isLiberado: true
            }
        });

        return { success: true, netAmountDeducted: netAmount, feeAmountRefunded: feeAmount };
    },

    /**
     * Records a withdrawal request and locks funds.
     */
    requestWithdrawal: async (tx: any, params: {
        walletId: number,
        valor: number,
        chavePixDestino: string,
        tipoChaveDestino: string
    }) => {
        const { walletId, valor, chavePixDestino, tipoChaveDestino } = params;

        // 1. Lock funds
        const result = await tx.wallet.updateMany({
            where: { id: walletId, saldoDisponivel: { gte: valor } },
            data: { saldoDisponivel: { decrement: valor } }
        });

        if (result.count === 0) {
            throw new Error("Saldo insuficiente ou carteira não encontrada.");
        }

        // 2. Create Saque record
        const withdrawal = await tx.saque.create({
            data: {
                walletId,
                valor,
                chavePixDestino,
                tipoChaveDestino: tipoChaveDestino as TipoChavePix,
                status: 'PENDENTE'
            }
        });

        // 3. Ledger entry
        // INC-02: Definir explicitamente o status da transação de saque como PENDENTE no momento do pedido.
        await tx.walletTransaction.create({
            data: {
                walletId,
                valor: -valor,
                tipo: 'SAQUE',
                status: 'PENDENTE',
                descricao: `Solicitação de Saque PIX #${withdrawal.id}`,
                metadataJson: { saqueId: withdrawal.id }
            }
        });

        return withdrawal;
    },

    /**
     * Finalizes a withdrawal. Funds were already locked at request.
     */
    approveWithdrawal: async (tx: any, params: {
        saqueId: number,
        adminId: number,
        comprovanteUrl?: string,
        transferenciaMpId?: string
    }) => {
        const { saqueId, adminId, comprovanteUrl, transferenciaMpId } = params;

        const updatedSaque = await tx.saque.update({
            where: { id: saqueId },
            data: {
                status: 'CONCLUIDO',
                comprovanteUrl,
                transferenciaMpId,
                aprovadoPorId: adminId
            }
        });

        // INC-02: Sincronizar status concluído com o Ledger
        const pendingTxs = await tx.walletTransaction.findMany({
            where: { tipo: 'SAQUE', status: 'PENDENTE', walletId: updatedSaque.walletId }
        });

        const relatedTx = pendingTxs.find((t: any) => (t.metadataJson as any)?.saqueId === saqueId);
        if (relatedTx) {
            await tx.walletTransaction.update({
                where: { id: relatedTx.id },
                data: { status: 'CONCLUIDO' }
            });
        }

        return updatedSaque;
    },

    /**
     * Rejects a withdrawal and UNLOCKS (returns) funds.
     */
    rejectWithdrawal: async (tx: any, params: {
        saqueId: number,
        adminId: number,
        motivoRejeicao: string
    }) => {
        const { saqueId, adminId, motivoRejeicao } = params;

        const withdrawal = await tx.saque.findUnique({ where: { id: saqueId } });
        if (!withdrawal) throw new Error("Saque não encontrado");

        // 1. Update status
        await tx.saque.update({
            where: { id: saqueId },
            data: {
                status: 'CANCELADO',
                motivoRejeicao,
                aprovadoPorId: adminId
            }
        });

        // 2. Restore funds
        await tx.wallet.update({
            where: { id: withdrawal.walletId },
            data: { saldoDisponivel: { increment: withdrawal.valor } }
        });

        // INC-02: Sincronizar status de Ledger de PENDENTE para CANCELADO
        const pendingTxs = await tx.walletTransaction.findMany({
            where: { tipo: 'SAQUE', status: 'PENDENTE', walletId: withdrawal.walletId }
        });

        const relatedTx = pendingTxs.find((t: any) => (t.metadataJson as any)?.saqueId === saqueId);
        if (relatedTx) {
            await tx.walletTransaction.update({
                where: { id: relatedTx.id },
                data: { status: 'CANCELADO' }
            });
        }

        // 3. Ledger entry (Reversal)
        await tx.walletTransaction.create({
            data: {
                walletId: withdrawal.walletId,
                valor: withdrawal.valor,
                tipo: 'ESTORNO',
                descricao: `Estorno de Saque Rejeitado #${withdrawal.id}`,
                metadataJson: { saqueId: withdrawal.id, motivo: motivoRejeicao }
            }
        });

        return true;
    },

    /**
     * Automatically moves pending balances (from credit cards) to available balance.
     * Default clearing period: 14 days.
     * Performance: Optimized to use batch updates per wallet.
     */
    processBalanceClearing: async (tx: any, diasClearing: number = 14) => {
        const now = new Date();
        const limitDate = new Date(now.getTime() - (diasClearing * 24 * 60 * 60 * 1000));

        // 1. Find all transactions that should be cleared
        const transactionsToClear = await tx.walletTransaction.findMany({
            where: {
                tipo: 'CREDITO_COTA',
                isLiberado: false,
                createdAt: { lt: limitDate }
            }
        });

        if (transactionsToClear.length === 0) return { processedCount: 0 };

        const resultsByWallet = new Map<number, Decimal>();
        const idsByWallet = new Map<number, number[]>();

        for (const t of transactionsToClear) {
            const currentValor = resultsByWallet.get(t.walletId) || new Decimal(0);
            resultsByWallet.set(t.walletId, currentValor.plus(t.valor));

            const currentIds = idsByWallet.get(t.walletId) || [];
            currentIds.push(t.id);
            idsByWallet.set(t.walletId, currentIds);
        }

        // 2. Mark all as cleared in a single batch update
        const allIds = transactionsToClear.map((t: any) => t.id);
        await tx.walletTransaction.updateMany({
            where: { id: { in: allIds } },
            data: { isLiberado: true }
        });

        // 3. Update wallet balances per wallet
        for (const [walletId, ids] of idsByWallet.entries()) {
            const totalAmount = resultsByWallet.get(walletId)!;

            // Update wallet balances (Atomic)
            await tx.wallet.update({
                where: { id: walletId },
                data: {
                    saldoPendente: { decrement: totalAmount },
                    saldoDisponivel: { increment: totalAmount }
                }
            });

            // Create a log entry for the clearing event
            if (totalAmount.greaterThan(0)) {
                await tx.walletTransaction.create({
                    data: {
                        walletId: walletId,
                        valor: 0, // mantendo 0 para constar no extrato como evento informativo, se desejado
                        tipo: 'CLEARING',
                        descricao: `Liberação de saldo pendente consolidada (R$ ${totalAmount.toFixed(2)})`,
                        isLiberado: true,
                        metadataJson: {
                            clearingDate: now,
                            totalCleared: totalAmount,
                            count: ids.length
                        }
                    }
                });
            }
        }

        return { processedCount: transactionsToClear.length, walletsAffected: resultsByWallet.size };
    }
};
