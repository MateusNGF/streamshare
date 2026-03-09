import { prisma } from "@/lib/db";
import { calcularProximoVencimento, calcularValorPeriodo, calcularDataVencimentoPadrao, escolherProximoDiaVencimento, calcularValorProRata } from "@/lib/financeiro-utils";
import { BillingDecision, ChargeCreationData, SubscriptionWithCharges } from "@/types/subscription.types";
import { isBefore, differenceInDays } from "date-fns";

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
        // We use hashtext to convert a stable string into a 32-bit integer for Postgres advisory locks.
        const lockKey = contaId ? `billing:renewal:${contaId}` : 'billing:renewal:global';

        return await prisma.$transaction(async (tx) => {
            // 1. Acquire advisory lock (session-level lock released at end of transaction)
            // pg_try_advisory_xact_lock returns true if lock acquired, false otherwise.
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

            // Cast to our strictly typed interface
            const assinaturasTyped = assinaturasAtivas as unknown as SubscriptionWithCharges[];

            const cobrancasParaCriar: Array<ChargeCreationData> = [];
            const assinaturasParaCancelar: number[] = [];
            const assinaturasParaSuspender: number[] = [];
            const agora = new Date();

            // 2. Mark pending charges with dataVencimento < agora as "atrasado"
            // Delegate to the new method for code reuse
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

            // 4. Execute Updates (passing tx to reuse the transaction)
            const txStartTime = performance.now();
            const result = await executeBillingTransactionWithTx(
                tx,
                cobrancasParaCriar,
                assinaturasParaCancelar,
                assinaturasParaSuspender,
                assinaturasTyped
            );

            const txDuration = performance.now() - txStartTime;
            if (txDuration > 2000) {
                console.warn(`[PERF_CAUTION] Transação de renovação (billing) demorou ${txDuration.toFixed(2)}ms para ${assinaturasAtivas.length} assinaturas.`);
            } else {
                console.log(`[PERF_INFO] Transação de renovação (billing) concluída em ${txDuration.toFixed(2)}ms.`);
            }

            return result;
        }, {
            timeout: 30000 // Increase timeout for bulk processing
        });
    },

    /**
     * Sincroniza o status das cobranças pendentes, marcando-as como "atrasado" se já passaram do vencimento.
     * Sendo executado separadamente, garante que os dados do banco estejam consistentes para as dashboards.
     */
    syncOverdueStatuses: async (filters?: { contaId?: number, participanteUserId?: number }, txOrPrisma?: any) => {
        const client = txOrPrisma || prisma;
        const agora = new Date();

        const whereClause: any = {
            status: "pendente",
            dataVencimento: { lt: agora }
        };

        if (filters?.contaId || filters?.participanteUserId) {
            whereClause.assinatura = {
                participante: {}
            };
            if (filters.contaId) whereClause.assinatura.participante.contaId = filters.contaId;
            if (filters.participanteUserId) whereClause.assinatura.participante.userId = filters.participanteUserId;
        }

        const stats = await client.cobranca.updateMany({
            where: whereClause,
            data: { status: "atrasado" }
        });

        if (stats.count > 0) {
            console.log(`[BILLING] Sincronização: ${stats.count} cobranças marcadas como atrasadas ${filters?.contaId ? `(Conta ${filters.contaId})` : '(Global)'}.`);
        }

        return stats.count;
    },

    /**
     * Updates the value of all pending charges when a subscription price changes.
     * This ensures the "next cycle" and current pending payments are correct.
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
            assinatura: {
                streaming: { contaId }
            }
        };

        if (streamingId) where.assinatura.streamingId = streamingId;
        if (assinaturaId) where.assinaturaId = assinaturaId;

        const pendingCharges = await tx.cobranca.findMany({
            where,
            include: {
                assinatura: {
                    select: { frequencia: true }
                }
            }
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

        // Criteria: (Suspended OR Pendente) AND charge covers the current date
        const isSuspendedOrPendente = assinatura.status === "suspensa" || assinatura.status === "pendente";
        const coversCurrentDate = agora >= cobranca.periodoInicio && agora <= cobranca.periodoFim;

        if (isSuspendedOrPendente && coversCurrentDate) {
            await tx.assinatura.update({
                where: { id: assinatura.id },
                data: {
                    status: "ativa",
                    dataSuspensao: null,
                    motivoSuspensao: null
                }
            });

            // Re-activation notification (Broadcast to Admins)
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
     * Helper to prepare and create the initial charge for a new subscription.
     */
    gerarCobrancaInicial: async (tx: any, params: {
        assinaturaId: number,
        valorMensal: number,
        frequencia: any,
        dataInicio: Date,
        pago: boolean,
        diasVencimento?: number[],
        manualMigration?: boolean
    }) => {
        const { assinaturaId, valorMensal, frequencia, dataInicio, pago, diasVencimento, manualMigration } = params;

        const isFixarVencimento = diasVencimento && diasVencimento.length > 0;

        const dataVencimento = isFixarVencimento
            ? escolherProximoDiaVencimento(diasVencimento, dataInicio)
            : calcularDataVencimentoPadrao(dataInicio); // ← base = dataInicio, not today

        const periodoFim = isFixarVencimento
            ? dataVencimento
            : calcularProximoVencimento(dataInicio, frequencia, dataInicio);

        const valorCobranca = isFixarVencimento
            ? calcularValorProRata(valorMensal, dataInicio, dataVencimento)
            : calcularValorPeriodo(valorMensal, frequencia);

        return await tx.cobranca.create({
            data: {
                assinaturaId,
                valor: valorCobranca,
                periodoInicio: dataInicio,
                periodoFim,
                status: pago ? "pago" : "pendente",
                dataPagamento: pago ? new Date() : null,
                dataVencimento,
                gatewayTransactionId: manualMigration ? "manual_migration" : null
            }
        });
    },

    /**
     * Generates multiple retroactive charges based on calculated cycles.
     */
    gerarCobrancasRetroativas: async (tx: any, params: {
        assinaturaId: number,
        ciclos: any[], // RetroactiveCycle[]
        paidIndices: number[]
    }) => {
        const { assinaturaId, ciclos, paidIndices } = params;
        const created = [];

        for (let i = 0; i < ciclos.length; i++) {
            const ciclo = ciclos[i];
            const isPaid = paidIndices.includes(i);

            const cobranca = await tx.cobranca.create({
                data: {
                    assinaturaId,
                    valor: ciclo.valor,
                    periodoInicio: ciclo.periodoInicio,
                    periodoFim: ciclo.periodoFim,
                    status: isPaid ? "pago" : "pendente",
                    dataPagamento: isPaid ? new Date() : null,
                    dataVencimento: ciclo.dataVencimento,
                    gatewayTransactionId: isPaid ? "manual_migration" : null
                }
            });
            created.push(cobranca);
        }

        return created;
    },

    /**
     * Cancela os Lotes de Pagamento que expiraram sem pagamento/aprovação.
     * Libera as faturas (cobrancas) de volta ao status livre.
     */
    cancelarLotesExpirados: async () => {
        const agora = new Date();
        return await prisma.$transaction(async (tx) => {
            const lotesExpirados = await tx.lotePagamento.findMany({
                where: {
                    status: "pendente",
                    expiresAt: { lt: agora }
                }
            });

            if (lotesExpirados.length === 0) return { cancelados: 0 };

            for (const lote of lotesExpirados) {
                await tx.lotePagamento.update({
                    where: { id: lote.id },
                    data: { status: "cancelado" }
                });

                // Liberta as cobranças vinculadas
                await tx.cobranca.updateMany({
                    where: { lotePagamentoId: lote.id },
                    data: {
                        lotePagamentoId: null,
                        status: "pendente"
                    }
                });
            }

            return { cancelados: lotesExpirados.length };
        });
    }
};

// --- Helper Functions (SOLID) ---

/**
 * Main switch-board for subscription decisions
 */
function evaluateSubscriptionRenewal(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const ultimaCobranca = assinatura.cobrancas[0];
    if (!ultimaCobranca) return { action: 'NONE' };

    // 1. Check for specific exit conditions (Cancellations)
    if (assinatura.dataCancelamento) {
        return checkScheduledCancellation(ultimaCobranca, agora);
    }

    // 2. Check for overdue issues (Inadimplência)
    const inadimplenciaDecision = checkInadimplencia(assinatura, agora);
    if (inadimplenciaDecision.action !== 'NONE') {
        return inadimplenciaDecision;
    }

    // 3. Check if it's time to generate a new charge (Renewal)
    return checkRenewalOpportunity(assinatura, ultimaCobranca, agora);
}

/**
 * SRP: Decide if subscription should be cancelled today based on end of paid period
 */
function checkScheduledCancellation(ultimaCobranca: any, agora: Date): BillingDecision {
    if (isBefore(ultimaCobranca.periodoFim, agora)) {
        return { action: 'CANCEL_SCHEDULED' };
    }
    return { action: 'NONE' };
}

/**
 * SRP: Decide if subscription should be suspended due to debt (Anti-Infinite Debt)
 */
function checkInadimplencia(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const cobrancasVencidas = assinatura.cobrancas.filter(c =>
        (c.status === "pendente" || c.status === "atrasado") && isBefore(c.dataVencimento, agora)
    );

    if (cobrancasVencidas.length > 0) {
        // Sort to find the oldest one
        const maisAntigaVencida = [...cobrancasVencidas].sort((a, b) =>
            a.dataVencimento.getTime() - b.dataVencimento.getTime()
        )[0];

        // Grace period: Suspend after 3 days of ACTUAL overdue (from dataVencimento)
        if (differenceInDays(agora, maisAntigaVencida.dataVencimento) >= 3) {
            return { action: 'SUSPEND' };
        }

        // Within grace period: Wait, don't generate new charges
        return { action: 'NONE' };
    }

    return { action: 'NONE' };
}

/**
 * SRP: Decide if it's time to create a new charge for the next cycle
 */
function checkRenewalOpportunity(assinatura: SubscriptionWithCharges, ultimaCobranca: any, agora: Date): BillingDecision {
    const diasParaFimPeriodo = differenceInDays(ultimaCobranca.periodoFim, agora);

    // Renew 5 days before the PREVIOUS period ends
    if (diasParaFimPeriodo <= 5) {
        const periodoInicio = ultimaCobranca.periodoFim;
        const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia, assinatura.dataInicio);
        const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

        const diasVencimento = assinatura.participante.conta?.diasVencimento || [];
        const nextDataVencimento = diasVencimento.length > 0
            ? escolherProximoDiaVencimento(diasVencimento, agora)
            : calcularDataVencimentoPadrao(agora);

        return {
            action: 'CREATE_CHARGE',
            data: {
                assinaturaId: assinatura.id,
                valor,
                periodoInicio,
                periodoFim,
                dataVencimento: nextDataVencimento
            }
        };
    }

    return { action: 'NONE' };
}

// Refactored to accept transaction object
async function executeBillingTransactionWithTx(
    tx: any,
    cobrancas: ChargeCreationData[],
    cancelamentos: number[],
    suspensoes: number[],
    assinaturasSource: SubscriptionWithCharges[]
) {
    let renovadas = 0;
    let canceladas = 0;
    let suspensas = 0;

    // 1. Process Suspensions (Higher priority to stop access)
    if (suspensoes.length > 0) {
        for (const id of suspensoes) {
            await tx.assinatura.update({
                where: { id },
                data: {
                    status: "suspensa",
                    motivoSuspensao: "Inadimplência (Faturas pendentes há mais de 3 dias)",
                    dataSuspensao: new Date()
                }
            });

            const ass = assinaturasSource.find(a => a.id === id);
            if (ass) {
                // 1. Notificar Usuário (Direct if linked)
                if (ass.participante.userId) {
                    await tx.notificacao.create({
                        data: {
                            contaId: ass.participante.contaId,
                            usuarioId: ass.participante.userId,
                            tipo: "assinatura_suspensa",
                            titulo: "Sua Assinatura foi Suspensa",
                            descricao: `Sua assinatura do serviço foi suspensa por falta de pagamento.`,
                            entidadeId: id,
                        }
                    });
                }

                // 2. Notificar Admins (Broadcast)
                await tx.notificacao.create({
                    data: {
                        contaId: ass.participante.contaId,
                        usuarioId: null,
                        tipo: "assinatura_suspensa",
                        titulo: "Assinatura Suspensa",
                        descricao: `A assinatura de ${ass.participante.nome} foi suspensa por inadimplência.`,
                        entidadeId: id,
                    }
                });
            }
            suspensas++;
        }
    }

    // 2. Process Charges
    for (const data of cobrancas) {
        // Idempotency check: Ensure no charge exists for this subscription starting on this date
        const existingCharge = await tx.cobranca.findFirst({
            where: {
                assinaturaId: data.assinaturaId,
                periodoInicio: data.periodoInicio
            }
        });

        if (existingCharge) {
            console.warn(`[BILLING] Skipping duplicate charge for subscription ${data.assinaturaId} (Start: ${data.periodoInicio})`);
            continue;
        }

        const assinatura = assinaturasSource.find(a => a.id === data.assinaturaId);
        const shouldAutoPay = assinatura?.cobrancaAutomaticaPaga ?? false;

        await tx.cobranca.create({
            data: {
                ...data,
                status: shouldAutoPay ? "pago" : "pendente",
                dataPagamento: shouldAutoPay ? new Date() : null,
                dataVencimento: data.dataVencimento
            }
        });
        renovadas++;
    }

    // 3. Process Cancellations
    if (cancelamentos.length > 0) {
        for (const id of cancelamentos) {
            await tx.assinatura.update({
                where: { id },
                data: { status: "cancelada" }
            });

            const ass = assinaturasSource.find(a => a.id === id);
            if (ass) {
                // 1. Notificar Usuário (Direct if linked)
                if (ass.participante.userId) {
                    await tx.notificacao.create({
                        data: {
                            contaId: ass.participante.contaId,
                            usuarioId: ass.participante.userId,
                            tipo: "assinatura_cancelada",
                            titulo: "Assinatura Encerrada",
                            descricao: `Seu período pago terminou e o acesso ao serviço foi encerrado.`,
                            entidadeId: id,
                        }
                    });
                }

                // 2. Notificar Admins (Broadcast)
                await tx.notificacao.create({
                    data: {
                        contaId: ass.participante.contaId,
                        usuarioId: null,
                        tipo: "assinatura_cancelada",
                        titulo: "Assinatura Encerrada",
                        descricao: `O período pago da assinatura de ${ass.participante.nome} terminou e o acesso foi revogado.`,
                        entidadeId: id,
                    }
                });
            }
            canceladas++;
        }
    }

    return { renovadas, canceladas, suspensas, totalProcessado: assinaturasSource.length };
}
