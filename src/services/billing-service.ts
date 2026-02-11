import { prisma } from "@/lib/db";
import { calcularProximoVencimento, calcularValorPeriodo } from "@/lib/financeiro-utils";
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
                            userId: true
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

            // 2. Mark pending charges with periodoFim < agora as "atrasado"
            await tx.cobranca.updateMany({
                where: {
                    status: "pendente",
                    periodoFim: { lt: agora }
                },
                data: { status: "atrasado" }
            });

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
            return executeBillingTransactionWithTx(
                tx,
                cobrancasParaCriar,
                assinaturasParaCancelar,
                assinaturasParaSuspender,
                assinaturasTyped
            );
        }, {
            timeout: 30000 // Increase timeout for bulk processing
        });
    }
};

// --- Helper Functions ---

function evaluateSubscriptionRenewal(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const ultimaCobranca = assinatura.cobrancas[0];
    if (!ultimaCobranca) return { action: 'NONE' };

    // Check scheduled cancellation
    if (assinatura.dataCancelamento) {
        if (isBefore(ultimaCobranca.periodoFim, agora)) {
            return { action: 'CANCEL_SCHEDULED' };
        }
        return { action: 'NONE' };
    }

    // --- Inadimplência Check (Anti-Dívida Infinita) ---
    // Se houver cobranças pendentes ou atrasadas já vencidas (passou do periodoFim)
    const cobrancasVencidas = assinatura.cobrancas.filter(c =>
        (c.status === "pendente" || c.status === "atrasado") && isBefore(c.periodoFim, agora)
    );

    if (cobrancasVencidas.length > 0) {
        // Se a cobrança mais antiga pendente venceu há mais de 3 dias, suspender acesso
        const maisAntigaVencida = cobrancasVencidas.sort((a, b) =>
            a.periodoFim.getTime() - b.periodoFim.getTime()
        )[0];

        if (differenceInDays(agora, maisAntigaVencida.periodoFim) >= 3) {
            return { action: 'SUSPEND' };
        }

        // Se está vencida mas em período de graça (< 3 dias), 
        // apenas não gera nova cobrança (Idempotência temporal)
        return { action: 'NONE' };
    }

    // --- Renewal Logic ---
    const diasParaVencimento = differenceInDays(ultimaCobranca.periodoFim, agora);

    if (diasParaVencimento <= 5) {
        const periodoInicio = ultimaCobranca.periodoFim;
        const periodoFim = calcularProximoVencimento(
            periodoInicio,
            assinatura.frequencia,
            assinatura.dataInicio
        );
        const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

        return {
            action: 'CREATE_CHARGE',
            data: {
                assinaturaId: assinatura.id,
                valor,
                periodoInicio,
                periodoFim
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
                await tx.notificacao.create({
                    data: {
                        contaId: ass.participante.contaId,
                        usuarioId: ass.participante.userId || null,
                        tipo: "assinatura_suspensa",
                        titulo: "Assinatura Suspensa",
                        descricao: `A assinatura de ${ass.participante.nome} foi suspensa por falta de pagamento.`,
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
                dataPagamento: shouldAutoPay ? new Date() : null
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
                await tx.notificacao.create({
                    data: {
                        contaId: ass.participante.contaId,
                        usuarioId: ass.participante.userId || null,
                        tipo: "assinatura_cancelada",
                        titulo: "Assinatura encerrada",
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
