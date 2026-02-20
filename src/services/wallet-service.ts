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
     * Processes a received payment, crediting the admin and debiting the platform fee.
     * ACID: Must be run inside a transaction confirming the charge.
     */
    processarCreditoPagamento: async (tx: any, params: {
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

        const taxaPercentual = new Decimal(process.env.TAXA_PLATAFORMA_PERCENTUAL ?? '5').div(100);
        const valorPagoDec = new Decimal(valorPago);

        const valorTaxa = valorPagoDec.mul(taxaPercentual).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        const valorLiquido = valorPagoDec.minus(valorTaxa).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        // Logic: PIX is available immediately. Cards go to pending (clearing period).
        const campoSaldo = metodoPagamento === 'PIX' ? 'saldoDisponivel' : 'saldoPendente';

        // Update Balance
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { [campoSaldo]: { increment: valorLiquido } }
        });

        // Create Ledger Entry: Credit
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: valorLiquido,
                tipo: 'CREDITO_COTA',
                descricao: `Pagamento recebido: Assinatura #${assinaturaId}`,
                referenciaGateway,
                metadataJson: { cobrancaId, participanteId },
            }
        });

        // Create Ledger Entry: Platform Fee
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                valor: valorTaxa.negated(),
                tipo: 'DEBITO_TAXA',
                descricao: `Taxa de Intermediação (${taxaPercentual.mul(100).toNumber()}%) — Ref #${cobrancaId}`,
                referenciaGateway,
            }
        });

        return { success: true, valorLiquido, valorTaxa };
    },

    /**
     * Records a withdrawal request and locks funds.
     */
    solicitarSaque: async (tx: any, params: {
        walletId: number,
        valor: number,
        chavePixDestino: string,
        tipoChaveDestino: string
    }) => {
        const { walletId, valor, chavePixDestino, tipoChaveDestino } = params;

        // 1. Lock funds
        await tx.wallet.update({
            where: { id: walletId },
            data: { saldoDisponivel: { decrement: valor } }
        });

        // 2. Create Saque record
        const saque = await tx.saque.create({
            data: {
                walletId,
                valor,
                chavePixDestino,
                tipoChaveDestino: tipoChaveDestino as TipoChavePix,
                status: 'PENDENTE'
            }
        });

        // 3. Ledger entry
        await tx.walletTransaction.create({
            data: {
                walletId,
                valor: -valor,
                tipo: 'SAQUE',
                descricao: `Solicitação de Saque PIX #${saque.id}`,
                metadataJson: { saqueId: saque.id }
            }
        });

        return saque;
    },

    /**
     * Finalizes a withdrawal. Funds were already locked at request.
     */
    aprovarSaque: async (tx: any, params: {
        saqueId: number,
        adminId: number,
        comprovanteUrl?: string,
        transferenciaMpId?: string
    }) => {
        const { saqueId, adminId, comprovanteUrl, transferenciaMpId } = params;

        return await tx.saque.update({
            where: { id: saqueId },
            data: {
                status: 'CONCLUIDO',
                comprovanteUrl,
                transferenciaMpId,
                aprovadoPorId: adminId
            }
        });
    },

    /**
     * Rejects a withdrawal and UNLOCKS (returns) funds.
     */
    rejeitarSaque: async (tx: any, params: {
        saqueId: number,
        adminId: number,
        motivoRejeicao: string
    }) => {
        const { saqueId, adminId, motivoRejeicao } = params;

        const saque = await tx.saque.findUnique({ where: { id: saqueId } });
        if (!saque) throw new Error("Saque não encontrado");

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
            where: { id: saque.walletId },
            data: { saldoDisponivel: { increment: saque.valor } }
        });

        // 3. Ledger entry (Reversal)
        await tx.walletTransaction.create({
            data: {
                walletId: saque.walletId,
                valor: saque.valor,
                tipo: 'ESTORNO',
                descricao: `Estorno de Saque Rejeitado #${saque.id}`,
                metadataJson: { saqueId: saque.id, motivo: motivoRejeicao }
            }
        });

        return true;
    }
};
