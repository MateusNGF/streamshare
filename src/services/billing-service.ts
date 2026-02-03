import { prisma } from "@/lib/db";
import { calcularProximoVencimento, calcularValorPeriodo } from "@/lib/financeiro-utils";

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
        const whereClause: any = {
            status: "ativa",
        };

        if (contaId) {
            whereClause.participante = { contaId };
        }

        // Find active subscriptions where the last charge is expiring soon
        const assinaturasAtivas = await prisma.assinatura.findMany({
            where: whereClause,
            include: {
                cobrancas: {
                    orderBy: { periodoFim: "desc" },
                    take: 1
                }
            }
        });

        const cobrancasParaCriar: Array<{
            assinaturaId: number;
            valor: number;
            periodoInicio: Date;
            periodoFim: Date;
        }> = [];

        // Prepare all charges to be created
        for (const assinatura of assinaturasAtivas) {
            const ultimaCobranca = assinatura.cobrancas[0];

            if (!ultimaCobranca) continue;

            // Generate new charge if last one expires in the next 5 days
            const diasParaVencimento = Math.ceil(
                (ultimaCobranca.periodoFim.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diasParaVencimento <= 5 && diasParaVencimento >= 0) {
                const periodoInicio = ultimaCobranca.periodoFim;
                const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
                const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

                cobrancasParaCriar.push({
                    assinaturaId: assinatura.id,
                    valor: Number(valor), // Convert Decimal to number for storage
                    periodoInicio,
                    periodoFim
                });
            }
        }

        // Create all charges in a single transaction (all or nothing)
        let renovadas = 0;
        if (cobrancasParaCriar.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const cobrancaData of cobrancasParaCriar) {
                    // Check if subscription has auto-pay enabled
                    const assinatura = assinaturasAtivas.find(a => a.id === cobrancaData.assinaturaId);
                    const shouldAutoPay = assinatura?.cobrancaAutomaticaPaga ?? false;

                    await tx.cobranca.create({
                        data: {
                            ...cobrancaData,
                            status: shouldAutoPay ? "pago" : "pendente",
                            dataPagamento: shouldAutoPay ? new Date() : null
                        }
                    });
                    renovadas++;
                }
            });
        }

        return { renovadas, totalProcessado: assinaturasAtivas.length };
    }
};
