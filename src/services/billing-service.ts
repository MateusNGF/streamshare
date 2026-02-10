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
        const whereClause: any = { status: "ativa" };
        if (contaId) whereClause.participante = { contaId };

        const assinaturasAtivas = await prisma.assinatura.findMany({
            where: whereClause,
            include: {
                participante: {
                    select: {
                        contaId: true,
                        nome: true
                    }
                },
                cobrancas: { orderBy: { periodoFim: "desc" }, take: 1 }
            }
        });

        // Cast to our strictly typed interface
        const assinaturasTyped = assinaturasAtivas as unknown as SubscriptionWithCharges[];

        const cobrancasParaCriar: Array<ChargeCreationData> = [];
        const assinaturasParaCancelar: number[] = [];
        const agora = new Date();

        // 1. Evaluate each subscription
        for (const assinatura of assinaturasTyped) {
            const decision = evaluateSubscriptionRenewal(assinatura, agora);

            if (decision.action === 'CREATE_CHARGE' && decision.data) {
                cobrancasParaCriar.push(decision.data);
            } else if (decision.action === 'CANCEL_SCHEDULED') {
                assinaturasParaCancelar.push(assinatura.id);
            }
        }

        // 2. Execute Updates
        return executeBillingTransaction(
            cobrancasParaCriar,
            assinaturasParaCancelar,
            assinaturasTyped
        );
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

    // Check renewal
    // Using date-fns differenceInDays for more robust calculation (handles DST etc)
    const diasParaVencimento = differenceInDays(ultimaCobranca.periodoFim, agora);

    // QA Fix: Allow catch-up for past dates (dias <= 5). 
    if (diasParaVencimento <= 5) {
        const periodoInicio = ultimaCobranca.periodoFim;
        // QA Fix: Use Anchor Date logic to prevent drift
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

async function executeBillingTransaction(
    cobrancas: ChargeCreationData[],
    cancelamentos: number[],
    assinaturasSource: SubscriptionWithCharges[]
) {
    let renovadas = 0;
    let canceladas = 0;

    await prisma.$transaction(async (tx) => {
        // Process Charges
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

        // Process Cancellations
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
                            usuarioId: null, // System notification
                            tipo: "assinatura_cancelada",
                            titulo: "Assinatura encerrada",
                            descricao: `O período pago da assinatura de ${ass.participante.nome} terminou e o acesso foi revogado.`,
                            entidadeId: id,
                            lida: false
                        }
                    });
                }
                canceladas++;
            }
        }
    });

    return { renovadas, canceladas, totalProcessado: assinaturasSource.length };
}
