import { StatusAssinatura } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addMonths, subYears, isBefore, isAfter, isValid } from "date-fns";

export const subscriptionValidator = {
    validateDates: (dataInicio: Date) => {
        if (!isValid(dataInicio)) {
            throw new Error("Data de início inválida");
        }

        const oneYearAgo = subYears(new Date(), 1);
        if (isBefore(dataInicio, oneYearAgo)) {
            throw new Error("Data de início não pode ser superior a 1 ano no passado");
        }

        const oneMonthAhead = addMonths(new Date(), 1);
        if (isAfter(dataInicio, oneMonthAhead)) {
            throw new Error("Data de início não pode ser superior a 1 mês no futuro");
        }
    },

    validateStreamingAccess: async (streamingId: number, contaId: number) => {
        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { in: [StatusAssinatura.ativa, StatusAssinatura.suspensa] }
                            }
                        }
                    }
                }
            }
        });

        if (!streaming) {
            throw new Error(`Streaming ID ${streamingId} não encontrado`);
        }

        if (streaming.contaId !== contaId) {
            throw new Error(`Você não tem permissão para usar o streaming ${streaming.catalogo.nome}`);
        }

        return streaming;
    },

    validateSlotAvailability: (streaming: any, requiredSlots: number = 1) => {
        const assinaturasAtivas = streaming._count.assinaturas;
        if (assinaturasAtivas + requiredSlots > streaming.limiteParticipantes) {
            throw new Error(`${streaming.catalogo.nome}: Vagas insuficientes. Necessário ${requiredSlots}, Disponível ${streaming.limiteParticipantes - assinaturasAtivas}`);
        }
    },

    validateDuplicateSubscription: async (participanteId: number, streamingId: number) => {
        const existing = await prisma.assinatura.findFirst({
            where: {
                participanteId: participanteId,
                streamingId: streamingId,
                NOT: {
                    status: StatusAssinatura.cancelada
                }
            }
        });

        if (existing) {
            throw new Error("Participante já possui uma assinatura ativa ou suspensa para este streaming.");
        }
    },

    validateValues: (valor: number) => {
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("Valor da assinatura deve ser maior que zero");
        }
    }
};
