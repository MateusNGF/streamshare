import { prisma } from "@/lib/db";
import { BulkCreateSubscriptionDTO } from "@/types/subscription.types";
import { determinarStatusInicial, parseLocalDate, gerarCiclosRetroativos } from "@/lib/financeiro-utils";
import { chargeFactory, ChargeData } from "./charge-factory";
import { isBefore, startOfDay } from "date-fns";
import { StatusAssinatura, Prisma } from "@prisma/client";
import { StreamingService } from "./streaming.service";

export class SubscriptionBulkService {
    static async validateCapacity(tx: Prisma.TransactionClient, demandMap: Map<number, number>, contaId: number) {
        const streamingIds = Array.from(demandMap.keys());
        const streamingsData = await Promise.all(
            streamingIds.map(id => StreamingService.findWithLock(id, tx))
        );

        for (const sId of streamingIds) {
            const streaming = streamingsData.find(s => s?.id === sId);
            if (!streaming || streaming.contaId !== contaId) {
                throw new Error(`Streaming ID ${sId} não encontrado ou sem permissão.`);
            }

            const currentCount = streaming._count.assinaturas;
            const neededParticipants = demandMap.get(sId) || 0;
            if (currentCount + neededParticipants > streaming.limiteParticipantes) {
                throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes (${streaming.limiteParticipantes - currentCount} disponíveis, ${neededParticipants} necessárias).`);
            }
        }

        return streamingsData.filter((s): s is NonNullable<typeof s> => s !== null);
    }

    static async processBulkCreation(tx: any, data: BulkCreateSubscriptionDTO, context: { contaId: number, userId: number }) {
        const { contaId } = context;
        const dataInicio = parseLocalDate(data.dataInicio);
        const hojeMidnight = startOfDay(new Date());
        const isRetroactive = isBefore(startOfDay(dataInicio), hojeMidnight);

        // Calculate Demand
        const demandMap = new Map<number, number>();
        data.assinaturasDedicadas.forEach(ass => {
            demandMap.set(ass.streamingId, (demandMap.get(ass.streamingId) || 0) + 1);
        });

        const streamingsData = await this.validateCapacity(tx, demandMap, contaId);

        const contaInfo = await tx.conta.findUnique({
            where: { id: contaId },
            select: { diasVencimento: true }
        });
        const diasVencimento = contaInfo?.diasVencimento || [];

        const cobrancasParaCriar: ChargeData[] = [];
        const results: Array<{ streamingId: number; assinaturaId: number; participanteId: number }> = [];

        for (const ass of data.assinaturasDedicadas) {
            const hasPaidRetroactive = data.retroactivePaidPeriods?.some(p => p.streamingId === ass.streamingId);

            const status = determinarStatusInicial({
                primeiroCicloJaPago: !!data.primeiroCicloJaPago,
                cobrancaAutomaticaPaga: !!data.cobrancaAutomaticaPaga,
                isRetroactive,
                hasPaidRetroactive: !!hasPaidRetroactive
            });

            const assinatura = await tx.assinatura.create({
                data: {
                    participanteId: ass.participanteId,
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

            results.push({ streamingId: ass.streamingId, assinaturaId: assinatura.id, participanteId: ass.participanteId });
        }

        // --- OPTIMISTIC LOCKING: Atomic Update of Streaming Versions (SOLID) ---
        for (const streaming of streamingsData) {
            await StreamingService.incrementVersion(streaming.id, streaming.version, tx);
        }

        return { results, cobrancasParaCriar, streamingsData };
    }
}
