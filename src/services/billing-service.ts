import { prisma } from "@/lib/db";
import { calcularProximoVencimento, calcularValorPeriodo } from "@/lib/financeiro-utils";
import { BillingDecision, SubscriptionWithCharges } from "@/types/subscription.types";
import { isBefore, differenceInDays } from "date-fns";
import { chargeFactory } from "./charge-factory";

/**
 * Service responsible for billing logic independent of user session.
 * Can be used by Server Actions (with auth) or Cron Jobs (system level).
 */
export const billingService = {
    /**
     * Process subscription renewals and generate new charges.
     * @param contaId Optional. If provided, processes only for that account. If null, processes all active subscriptions (Cron mode).
     */
    processarRenovacoes: async (contaId?: number) => {
        // Use a unique lock key for billing.
        const lockKey = contaId ? `billing:renewal:${contaId}` : 'billing:renewal:global';

        return await prisma.$transaction(async (tx) => {
            // 1. Acquire advisory lock
            const [{ lock_acquired }] = await tx.$queryRawUnsafe<any>(
                `SELECT pg_try_advisory_xact_lock(hashtext($1)) as lock_acquired`,
                lockKey
            );

            if (!lock_acquired) {
                console.warn(`[BILLING] Process already running for ${contaId ? `account ${contaId}` : 'all accounts'}. Skipping.`);
                return { renovadas: 0, canceladas: 0, suspensas: 0, totalProcessado: 0, skipped: true };
            }

            const whereClause: any = { status: "ativa" };
            if (contaId) whereClause.participante = { contaId };

            const assinaturasAtivas = await tx.assinatura.findMany({
                where: whereClause,
                include: {
                    participante: {
                        select: {
                            contaId: true,
                            nome: true,
                            userId: true,
                            conta: {
                                select: { diasVencimento: true }
                            }
                        }
                    },
                    cobrancas: { orderBy: { periodoFim: "desc" }, take: 1 }
                }
            });

            const assinaturasTyped = assinaturasAtivas as unknown as SubscriptionWithCharges[];
            const cobrancasParaCriar: any[] = [];
            const assinaturasParaCancelar: number[] = [];
            const assinaturasParaSuspender: number[] = [];
            const agora = new Date();

            // 2. Sync Overdue statuses
            await billingService.syncOverdueStatuses({ contaId }, tx);

            // 3. Evaluate each subscription
            for (const assinatura of assinaturasTyped) {
                const decision = evaluateSubscriptionRenewal(assinatura, agora);

                if (decision.action === 'CREATE_CHARGE' && decision.data) {
                    cobrancasParaCriar.push(decision.data);
                } else if (decision.action === 'CANCEL_SCHEDULED') {
                    assinaturasParaCancelar.push(assinatura.id);
                } else if (decision.action === 'SUSPEND') {
                    assinaturasParaSuspender.push(assinatura.id);
                }
            }

            // 4. Execute updates
            return await executeBillingTransactionWithTx(
                tx,
                cobrancasParaCriar,
                assinaturasParaCancelar,
                assinaturasParaSuspender,
                assinaturasTyped
            );
        }, { timeout: 30000 });
    },

    /**
     * Sincroniza o status das cobranças pendentes, marcando-as como "atrasado" se já passaram do vencimento.
     */
    syncOverdueStatuses: async (filters?: { contaId?: number, participanteUserId?: number }, txOrPrisma?: any) => {
        const client = txOrPrisma || prisma;
        const agora = new Date();

        const whereClause: any = {
            status: "pendente",
            dataVencimento: { lt: agora }
        };

        if (filters?.contaId || filters?.participanteUserId) {
            whereClause.assinatura = { participante: {} };
            if (filters.contaId) whereClause.assinatura.participante.contaId = filters.contaId;
            if (filters.participanteUserId) whereClause.assinatura.participante.userId = filters.participanteUserId;
        }

        const stats = await client.cobranca.updateMany({
            where: whereClause,
            data: { status: "atrasado" }
        });

        if (stats.count > 0) {
            console.log(`[BILLING] Sincronização: ${stats.count} faturas marcadas como atrasadas.`);
        }

        return stats.count;
    },

    /**
     * Updates the value of all pending charges when a subscription price changes.
     */
    ajustarPrecosPendentes: async (tx: any, params: {
        streamingId?: number,
        assinaturaId?: number,
        novoValorMensal: number,
        contaId: number
    }) => {
        const { streamingId, assinaturaId, novoValorMensal, contaId } = params;

        const where: any = {
            status: "pendente",
            assinatura: { streaming: { contaId } }
        };

        if (streamingId) where.assinatura.streamingId = streamingId;
        if (assinaturaId) where.assinaturaId = assinaturaId;

        const pendingCharges = await tx.cobranca.findMany({
            where,
            include: { assinatura: { select: { frequencia: true } } }
        });

        for (const charge of pendingCharges) {
            const novoValorCobranca = calcularValorPeriodo(novoValorMensal, charge.assinatura.frequencia);
            await tx.cobranca.update({
                where: { id: charge.id },
                data: { valor: novoValorCobranca }
            });
        }

        return pendingCharges.length;
    },

    /**
     * Evaluates and performs subscription activation or reactivation after a payment is confirmed.
     */
    avaliarAtivacaoAposPagamento: async (tx: any, params: {
        assinatura: any,
        cobranca: any,
        contaId: number,
        agora: Date
    }) => {
        const { assinatura, cobranca, contaId, agora } = params;

        const isSuspendedOrPendente = assinatura.status === "suspensa" || assinatura.status === "pendente";
        const coversCurrentDate = agora >= cobranca.periodoInicio && agora <= cobranca.periodoFim;

        if (isSuspendedOrPendente && coversCurrentDate) {
            await tx.assinatura.update({
                where: { id: assinatura.id },
                data: { status: "ativa", dataSuspensao: null, motivoSuspensao: null }
            });

            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "assinatura_editada",
                    titulo: assinatura.status === "pendente" ? "Assinatura Ativada" : "Assinatura Reativada",
                    descricao: assinatura.status === "pendente"
                        ? `A assinatura de ${assinatura.participante.nome} foi ativada após a confirmação do primeiro pagamento.`
                        : `A assinatura de ${assinatura.participante.nome} foi reativada automaticamente após o pagamento da cobrança atual.`,
                    entidadeId: assinatura.id,
                }
            });

            return true;
        }

        return false;
    },

    /**
     * @deprecated Use chargeFactory.createInitialChargeData
     */
    gerarCobrancaInicial: async (tx: any, params: any) => {
        const data = chargeFactory.createInitialChargeData(params);
        return await tx.cobranca.create({ data: data as any });
    },

    /**
     * @deprecated Use chargeFactory.createRetroactiveChargesData
     */
    gerarCobrancasRetroativas: async (tx: any, params: any) => {
        const charges = chargeFactory.createRetroactiveChargesData(params);
        return await tx.cobranca.createMany({ data: charges as any });
    },

    /**
     * Cancela os Lotes de Pagamento que expiraram.
     */
    cancelarLotesExpirados: async () => {
        const agora = new Date();
        return await prisma.$transaction(async (tx) => {
            const lotesExpirados = await tx.lotePagamento.findMany({
                where: { status: "pendente", expiresAt: { lt: agora } }
            });

            if (lotesExpirados.length === 0) return { cancelados: 0 };

            for (const lote of lotesExpirados) {
                await tx.lotePagamento.update({ where: { id: lote.id }, data: { status: "cancelado" } });
                await tx.cobranca.updateMany({
                    where: { lotePagamentoId: lote.id },
                    data: { lotePagamentoId: null, status: "pendente" }
                });
            }

            return { cancelados: lotesExpirados.length };
        });
    }
};

// --- Helper Functions (SOLID) ---

function evaluateSubscriptionRenewal(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const ultimaCobranca = assinatura.cobrancas[0];
    if (!ultimaCobranca) return { action: 'NONE' };

    if (assinatura.dataCancelamento) {
        return checkScheduledCancellation(ultimaCobranca, agora);
    }

    const inadimplenciaDecision = checkInadimplencia(assinatura, agora);
    if (inadimplenciaDecision.action !== 'NONE') return inadimplenciaDecision;

    return checkRenewalOpportunity(assinatura, ultimaCobranca, agora);
}

function checkScheduledCancellation(ultimaCobranca: any, agora: Date): BillingDecision {
    if (isBefore(ultimaCobranca.periodoFim, agora)) return { action: 'CANCEL_SCHEDULED' };
    return { action: 'NONE' };
}

function checkInadimplencia(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const cobrancasVencidas = assinatura.cobrancas.filter(c =>
        (c.status === "pendente" || c.status === "atrasado") && isBefore(c.dataVencimento, agora)
    );

    if (cobrancasVencidas.length > 0) {
        const maisAntigaVencida = [...cobrancasVencidas].sort((a, b) =>
            a.dataVencimento.getTime() - b.dataVencimento.getTime()
        )[0];

        if (differenceInDays(agora, maisAntigaVencida.dataVencimento) >= 3) {
            return { action: 'SUSPEND' };
        }
        return { action: 'NONE' };
    }

    return { action: 'NONE' };
}

function checkRenewalOpportunity(assinatura: SubscriptionWithCharges, ultimaCobranca: any, agora: Date): BillingDecision {
    const diasParaFimPeriodo = differenceInDays(ultimaCobranca.periodoFim, agora);

    if (diasParaFimPeriodo <= 5) {
        const chargeData = chargeFactory.createRenewalChargeData({
            assinaturaId: assinatura.id,
            valorMensal: assinatura.valor,
            frequencia: assinatura.frequencia,
            periodoInicio: ultimaCobranca.periodoFim,
            dataInicioAssinatura: assinatura.dataInicio,
            diasVencimento: assinatura.participante.conta?.diasVencimento || [],
            referenciaVencimento: agora
        });

        return { action: 'CREATE_CHARGE', data: chargeData as any };
    }

    return { action: 'NONE' };
}

async function executeBillingTransactionWithTx(
    tx: any,
    cobrancas: any[],
    cancelamentos: number[],
    suspensoes: number[],
    assinaturasSource: SubscriptionWithCharges[]
) {
    let renovadas = 0;
    let canceladas = 0;
    let suspensas = 0;

    // 1. Process Suspensions
    for (const id of suspensoes) {
        const ass = assinaturasSource.find(a => a.id === id);
        if (!ass) continue;

        await tx.assinatura.update({
            where: { id },
            data: { status: "suspensa", motivoSuspensao: "Inadimplência (+3 dias)", dataSuspensao: new Date() }
        });

        if (ass.participante.userId) {
            await tx.notificacao.create({
                data: {
                    contaId: ass.participante.contaId,
                    usuarioId: ass.participante.userId,
                    tipo: "assinatura_suspensa",
                    titulo: "Sua Assinatura foi Suspensa",
                    descricao: `Sua assinatura foi suspensa por falta de pagamento.`,
                    entidadeId: id,
                }
            });
        }
        suspensas++;
    }

    // 2. Process Charges
    for (const data of cobrancas) {
        const existingCharge = await tx.cobranca.findFirst({
            where: { assinaturaId: data.assinaturaId, periodoInicio: data.periodoInicio }
        });

        if (existingCharge) continue;

        const assinatura = assinaturasSource.find(a => a.id === data.assinaturaId);
        const shouldAutoPay = assinatura?.cobrancaAutomaticaPaga ?? false;

        await tx.cobranca.create({
            data: {
                ...data,
                status: shouldAutoPay ? "pago" : "pendente",
                dataPagamento: shouldAutoPay ? new Date() : null,
            }
        });
        renovadas++;
    }

    // 3. Process Cancellations
    for (const id of cancelamentos) {
        const ass = assinaturasSource.find(a => a.id === id);
        if (!ass) continue;

        await tx.assinatura.update({ where: { id }, data: { status: "cancelada" } });

        if (ass.participante.userId) {
            await tx.notificacao.create({
                data: {
                    contaId: ass.participante.contaId,
                    usuarioId: ass.participante.userId,
                    tipo: "assinatura_cancelada",
                    titulo: "Assinatura Encerrada",
                    descricao: `Seu período pago terminou e o acesso foi encerrado.`,
                    entidadeId: id,
                }
            });
        }
        canceladas++;
    }

    return { renovadas, canceladas, suspensas, totalProcessado: assinaturasSource.length };
}
