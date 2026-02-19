import { prisma } from "@/lib/db";
import { calcularProximoVencimento, calcularValorPeriodo, calcularDataVencimentoPadrao } from "@/lib/financeiro-utils";
import { BillingDecision, ChargeCreationData, SubscriptionWithCharges } from "@/types/subscription.types";
import { isBefore, differenceInDays } from "date-fns";
import { createPixPayment, mpPreApproval } from "@/lib/mercado-pago";
import { MetodoPagamento } from "@prisma/client";

/**
 * Service responsible for billing logic independent of user session.
 */
export const billingService = {
    /**
     * Entry point for daily billing cron.
     */
    processarCicloCobranca: async () => {
        return await prisma.$transaction(async (tx) => {
            const lockKey = 'billing:cycle:global';
            const [{ lock_acquired }] = await tx.$queryRawUnsafe<any>(
                `SELECT pg_try_advisory_xact_lock(hashtext($1)) as lock_acquired`,
                lockKey
            );

            if (!lock_acquired) return { skipped: true };

            const saas = await billingService.processarPlanosSaaS(tx);
            const streamings = await billingService.executarRenovacoesStreamings(tx);

            return { saas, streamings };
        }, { timeout: 60000 });
    },

    /**
     * SaaS Plan Life-cycle Management
     */
    processarPlanosSaaS: async (tx: any) => {
        const contasPremium = await tx.conta.findMany({
            where: {
                plano: { not: "free" },
                gatewaySubscriptionId: { not: null }
            }
        });

        let downgrades = 0;
        for (const conta of contasPremium) {
            try {
                const mpSub = await mpPreApproval.get({ id: conta.gatewaySubscriptionId! });

                if (mpSub.status === 'cancelled') {
                    await tx.conta.update({
                        where: { id: conta.id },
                        data: {
                            plano: "free",
                            gatewaySubscriptionStatus: "cancelled"
                        }
                    });

                    await tx.notificacao.create({
                        data: {
                            contaId: conta.id,
                            tipo: "plano_alterado",
                            titulo: "Assinatura Planos Encerrada",
                            descricao: "Sua conta retornou ao plano gratuito por cancelamento no gateway.",
                            metadata: { gatewayId: conta.gatewaySubscriptionId }
                        }
                    });
                    downgrades++;
                }
            } catch (error) {
                console.error(`[BILLING_SAAS] Error on account ${conta.id}:`, error);
            }
        }
        return { total: contasPremium.length, downgrades };
    },

    /**
     * Streaming Subscriptions Renewal
     */
    executarRenovacoesStreamings: async (tx: any, contaId?: number) => {
        const whereClause: any = { status: "ativa" };
        if (contaId) whereClause.participante = { contaId };

        const assinaturasAtivas = await tx.assinatura.findMany({
            where: whereClause,
            include: {
                participante: { select: { contaId: true, nome: true, userId: true, email: true } },
                streaming: { include: { catalogo: true } },
                cobrancas: { orderBy: { periodoFim: "desc" }, take: 1 }
            }
        });

        const assinaturasTyped = assinaturasAtivas as unknown as SubscriptionWithCharges[];
        const agora = new Date();

        // 1. Mark overdue
        await tx.cobranca.updateMany({
            where: {
                status: "pendente",
                dataVencimento: { lt: agora }
            },
            data: { status: "atrasado" }
        });

        const cobrancasParaCriar: Array<ChargeCreationData> = [];
        const assinaturasParaCancelar: number[] = [];
        const assinaturasParaSuspender: number[] = [];

        for (const assinatura of assinaturasTyped) {
            const decision = evaluateSubscriptionRenewal(assinatura, agora);
            if (decision.action === 'CREATE_CHARGE') cobrancasParaCriar.push(decision.data);
            else if (decision.action === 'CANCEL_SCHEDULED') assinaturasParaCancelar.push(assinatura.id);
            else if (decision.action === 'SUSPEND') assinaturasParaSuspender.push(assinatura.id);
        }

        return await executeBillingTransactionWithTx(
            tx,
            cobrancasParaCriar,
            assinaturasParaCancelar,
            assinaturasParaSuspender,
            assinaturasTyped
        );
    },

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
                    tipo: "assinatura_editada",
                    titulo: "Assinatura Reativada",
                    descricao: `A assinatura de ${assinatura.participante.nome} foi ativada após pagamento.`,
                    entidadeId: assinatura.id,
                }
            });
            return true;
        }
        return false;
    },

    gerarCobrancaInicial: async (tx: any, params: {
        assinaturaId: number,
        valorMensal: number,
        frequencia: any,
        dataInicio: Date,
        pago: boolean
    }) => {
        const { assinaturaId, valorMensal, frequencia, dataInicio, pago } = params;
        const periodoFim = calcularProximoVencimento(dataInicio, frequencia, dataInicio);
        const valorCobranca = calcularValorPeriodo(valorMensal, frequencia);

        return await tx.cobranca.create({
            data: {
                assinaturaId,
                valor: valorCobranca,
                periodoInicio: dataInicio,
                periodoFim,
                status: pago ? "pago" : "pendente",
                dataPagamento: pago ? new Date() : null,
                dataVencimento: calcularDataVencimentoPadrao(new Date())
            }
        });
    }
};

// --- Helpers ---

function evaluateSubscriptionRenewal(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const ultimaCobranca = assinatura.cobrancas[0];
    if (!ultimaCobranca) return { action: 'NONE' };
    if (assinatura.dataCancelamento && isBefore(ultimaCobranca.periodoFim, agora)) return { action: 'CANCEL_SCHEDULED' };
    if (!assinatura.autoRenovacao && isBefore(ultimaCobranca.periodoFim, agora)) return { action: 'CANCEL_SCHEDULED' };

    const overdue = checkInadimplencia(assinatura, agora);
    if (overdue.action !== 'NONE') return overdue;

    return checkRenewalOpportunity(assinatura, ultimaCobranca, agora);
}

function checkInadimplencia(assinatura: SubscriptionWithCharges, agora: Date): BillingDecision {
    const vencidas = assinatura.cobrancas.filter(c =>
        (c.status === "pendente" || c.status === "atrasado") && isBefore(c.dataVencimento, agora)
    );

    if (vencidas.length > 0) {
        const maisAntiga = [...vencidas].sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime())[0];
        if (differenceInDays(agora, maisAntiga.dataVencimento) >= 3) return { action: 'SUSPEND' };
    }
    return { action: 'NONE' };
}

function checkRenewalOpportunity(assinatura: SubscriptionWithCharges, ultimaCobranca: any, agora: Date): BillingDecision {
    if (!assinatura.autoRenovacao) return { action: 'NONE' };
    if (differenceInDays(ultimaCobranca.periodoFim, agora) <= 5) {
        const periodoInicio = ultimaCobranca.periodoFim;
        const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia, assinatura.dataInicio);
        return {
            action: 'CREATE_CHARGE',
            data: {
                assinaturaId: assinatura.id,
                valor: calcularValorPeriodo(assinatura.valor, assinatura.frequencia),
                periodoInicio,
                periodoFim,
                dataVencimento: calcularDataVencimentoPadrao(agora),
                metodoPagamento: assinatura.cobrancaAutomaticaPaga ? 'CREDIT_CARD' : 'PIX',
                externalReference: `sub_${assinatura.id}_${periodoInicio.getTime()}`
            }
        };
    }
    return { action: 'NONE' };
}

async function executeBillingTransactionWithTx(tx: any, cobrancas: ChargeCreationData[], cancelamentos: number[], suspensoes: number[], source: SubscriptionWithCharges[]) {
    let renovadas = 0, canceladas = 0, suspensas = 0;

    // B2 FIX: Pre-generate all PIX payments BEFORE opening DB transaction.
    // External HTTP calls to Mercado Pago must NOT happen inside a $transaction
    // to avoid holding a PG connection open during a slow/failing HTTP request.
    // Pattern: reserve-then-commit (all MP calls first, then a single fast DB write).
    const gatewayDataMap = new Map<string, any>();

    for (const data of cobrancas) {
        const { externalReference, ...prismaData } = data;
        if (prismaData.metodoPagamento !== 'PIX') continue;

        const ass = source.find(a => a.id === prismaData.assinaturaId);
        if (!ass) continue;

        const res = await createPixPayment({
            id: externalReference!,
            title: `Renovação ${ass.streaming.catalogo.nome}`,
            description: `Mensalidade ${ass.participante.nome}`,
            unit_price: prismaData.valor.toNumber(),
            email: ass.participante.email || 'financeiro@streamshare.com.br',
            external_reference: externalReference!
        });

        if (res.success) {
            gatewayDataMap.set(externalReference!, {
                gatewayId: res.id,
                gatewayProvider: 'mercadopago',
                pixQrCode: res.qr_code_base64,
                pixCopiaECola: res.qr_code
            });
        } else {
            console.error(`[BILLING] Failed to create PIX for ${externalReference}:`, res.error);
        }
    }

    // Now persist all results in the DB (fast path — no external calls)
    for (const id of suspensoes) {
        await tx.assinatura.update({ where: { id }, data: { status: "suspensa", dataSuspensao: new Date() } });
        suspensas++;
    }

    for (const data of cobrancas) {
        const { externalReference, ...prismaData } = data;

        const exists = await tx.cobranca.findFirst({
            where: {
                assinaturaId: prismaData.assinaturaId,
                periodoInicio: prismaData.periodoInicio
            }
        });
        if (exists) continue;

        const gatewayData = gatewayDataMap.get(externalReference!) ?? {};

        await tx.cobranca.create({
            data: {
                ...prismaData,
                status: "pendente",
                ...gatewayData
            }
        });
        renovadas++;
    }

    for (const id of cancelamentos) {
        await tx.assinatura.update({ where: { id }, data: { status: "cancelada" } });
        canceladas++;
    }

    return { renovadas, canceladas, suspensas };
}
