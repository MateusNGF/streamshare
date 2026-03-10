import { prisma } from "@/lib/db";
import { BulkCreateSubscriptionDTO } from "@/types/subscription.types";
import { determinarStatusInicial, parseLocalDate, gerarCiclosRetroativos } from "@/lib/financeiro-utils";
import { chargeFactory, ChargeData } from "./charge-factory";
import { isBefore, startOfDay } from "date-fns";
import { StatusAssinatura, Prisma } from "@prisma/client";

export class SubscriptionBulkService {
    static async validateCapacity(tx: Prisma.TransactionClient, streamingIds: number[], contaId: number, neededParticipants: number) {
        const streamingsData = await tx.streaming.findMany({
            where: {
                id: { in: streamingIds },
                contaId
            },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa, StatusAssinatura.pendente] } }
                        }
                    }
                }
            }
        });

        for (const sId of streamingIds) {
            const streaming = streamingsData.find(s => s.id === sId);
            if (!streaming) throw new Error(`Streaming ID ${sId} não encontrado ou sem permissão.`);

            const currentCount = streaming._count.assinaturas;
            if (currentCount + neededParticipants > streaming.limiteParticipantes) {
                throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes (${streaming.limiteParticipantes - currentCount} disponíveis, ${neededParticipants} necessárias).`);
            }
        }

        return streamingsData;
    }

    static async processBulkCreation(tx: any, data: BulkCreateSubscriptionDTO, context: { contaId: number, userId: number }) {
        const { contaId, userId } = context;
        const dataInicio = parseLocalDate(data.dataInicio);
        const hojeMidnight = startOfDay(new Date());
        const isRetroactive = isBefore(startOfDay(dataInicio), hojeMidnight);

        const streamingIds = Array.from(new Set(data.assinaturas.map(a => a.streamingId)));
        const streamingsData = await this.validateCapacity(tx, streamingIds, contaId, data.participanteIds.length);

        const contaInfo = await tx.conta.findUnique({
            where: { id: contaId },
            select: { diasVencimento: true }
        });
        const diasVencimento = contaInfo?.diasVencimento || [];

        const cobrancasParaCriar: ChargeData[] = [];
        const results: Array<{ streamingId: number; assinaturaId: number; participanteId: number }> = [];

        for (const participanteId of data.participanteIds) {
            for (const ass of data.assinaturas) {
                const hasPaidRetroactive = data.retroactivePaidPeriods?.some(p => p.streamingId === ass.streamingId);

                const status = determinarStatusInicial({
                    primeiroCicloJaPago: !!data.primeiroCicloJaPago,
                    cobrancaAutomaticaPaga: !!data.cobrancaAutomaticaPaga,
                    isRetroactive,
                    hasPaidRetroactive: !!hasPaidRetroactive
                });

                const assinatura = await tx.assinatura.create({
                    data: {
                        participanteId,
                        streamingId: ass.streamingId,
                        frequencia: ass.frequencia,
                        valor: ass.valor,
                        dataInicio,
                        status: status,
                        cobrancaAutomaticaPaga: data.cobrancaAutomaticaPaga ?? false,
                    }
                });

                // Charge preparation using Factory
                if (isRetroactive) {
                    const retroPaid = data.retroactivePaidPeriods
                        ?.filter(p => p.streamingId === ass.streamingId)
                        .map(p => p.index) || [];

                    // If "migração" (primeiroCicloJaPago) is enabled, the LAST cycle generated 
                    // (which is the one that covers today) should also be marked as paid.
                    if (data.primeiroCicloJaPago) {
                        const tempCycles = gerarCiclosRetroativos({
                            dataInicio,
                            frequencia: ass.frequencia,
                            valorMensal: ass.valor,
                            diasVencimento
                        });
                        if (tempCycles.length > 0) {
                            const lastIndex = tempCycles.length - 1;
                            if (!retroPaid.includes(lastIndex)) {
                                retroPaid.push(lastIndex);
                            }
                        }
                    }

                    const retroactiveCharges = chargeFactory.createRetroactiveChargesData({
                        assinaturaId: assinatura.id,
                        dataInicio,
                        frequencia: ass.frequencia,
                        valorMensal: ass.valor,
                        diasVencimento,
                        paidIndices: retroPaid
                    });
                    cobrancasParaCriar.push(...retroactiveCharges);
                } else {
                    const initialCharge = chargeFactory.createInitialChargeData({
                        assinaturaId: assinatura.id,
                        valorMensal: ass.valor,
                        frequencia: ass.frequencia,
                        dataInicio,
                        diasVencimento,
                        isPaid: !!data.primeiroCicloJaPago || !!data.cobrancaAutomaticaPaga,
                        manualMigration: !!data.primeiroCicloJaPago
                    });
                    cobrancasParaCriar.push(initialCharge);
                }

                results.push({ streamingId: ass.streamingId, assinaturaId: assinatura.id, participanteId });
            }
        }

        return { results, cobrancasParaCriar, streamingsData };
    }
}
