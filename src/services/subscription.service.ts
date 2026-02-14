import { Prisma, FrequenciaPagamento } from "@prisma/client";
import {
    calcularTotalCiclo,
    calcularProximoVencimento,
    calcularDataVencimentoPadrao
} from "@/lib/financeiro-utils";

export class SubscriptionService {
    /**
     * Creates a new subscription for a participant in a streaming service.
     * Includes creating the initial pending charge.
     * 
     * @param tx - Prisma Transaction Client
     * @param participanteId - ID of the participant
     * @param streamingId - ID of the streaming service
     * @param dtInicio - Start date of the subscription (default: now)
     */
    static async createFromStreaming(
        tx: Prisma.TransactionClient,
        participanteId: number,
        streamingId: number,
        frequencia: FrequenciaPagamento = "mensal",
        dtInicio: Date = new Date()
    ) {
        // 1. Fetch Streaming to get value and limits
        const streaming = await tx.streaming.findUnique({
            where: { id: streamingId },
            include: {
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ["ativa", "suspensa"] } }
                        }
                    }
                }
            }
        });

        if (!streaming) throw new Error("Streaming não encontrado.");

        // 2. Validate Limits (Double check inside transaction)
        if (streaming._count.assinaturas >= streaming.limiteParticipantes) {
            throw new Error(`Limite de vagas excedido. O streaming possui ${streaming._count.assinaturas}/${streaming.limiteParticipantes} assinantes.`);
        }

        // 3. Calculate Values
        const valorPorPessoa = streaming.valorIntegral.toNumber() / streaming.limiteParticipantes;

        // 4. Create Subscription
        const assinatura = await tx.assinatura.create({
            data: {
                participanteId,
                streamingId,
                frequencia,
                valor: valorPorPessoa,
                dataInicio: dtInicio,
                status: "ativa"
            }
        });

        // 5. Create Initial Charge
        // The first charge covers the first period (e.g. first month)
        const valorCobranca = calcularTotalCiclo(valorPorPessoa, frequencia);

        // Next due date for the *subscription* (recurrence)
        const proximoVencimentoAssinatura = calcularProximoVencimento(dtInicio, frequencia, dtInicio);

        // Due date for the *bill* (when the user must pay)
        // Usually 5 days from now for the initial setup
        const dataVencimentoCobranca = calcularDataVencimentoPadrao(dtInicio);

        await tx.cobranca.create({
            data: {
                assinaturaId: assinatura.id,
                valor: valorCobranca,
                periodoInicio: dtInicio,
                periodoFim: proximoVencimentoAssinatura,
                status: "pendente",
                dataVencimento: dataVencimentoCobranca
            }
        });

        return assinatura;
    }
}
