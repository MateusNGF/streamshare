"use server";

import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento } from "@prisma/client";
import { StreamingService } from "@/services/streaming.service";
import { ParticipantService } from "@/services/participant.service";

export async function publicSubscribe(data: {
    token: string;
    userId?: number;
    nome: string;
    email: string;
    whatsappNumero: string;
    cpf?: string;
    frequencia?: FrequenciaPagamento;
    quantidade?: number;
}) {
    // 1. Validar Streaming e Token
    const streaming = await StreamingService.validatePublicToken(data.token.trim());

    if (!streaming) {
        throw new Error("Streaming não disponível ou link inválido.");
    }

    // 2. Verificar Vagas
    const quantidade = data.quantidade || 1;
    if (streaming.vagasRestantes < quantidade) {
        throw new Error(streaming.vagasRestantes > 0
            ? `Não há vagas suficientes. Restam apenas ${streaming.vagasRestantes} vaga(s).`
            : "Não há vagas disponíveis para este streaming.");
    }

    await prisma.$transaction(async (tx) => {
        // 3. Garantir Participante
        const participante = await ParticipantService.findOrCreateParticipant(tx, {
            contaId: streaming.contaId,
            nome: data.nome,
            email: data.email,
            whatsappNumero: data.whatsappNumero,
            userId: data.userId,
            cpf: data.cpf
        });

        // 4. Verificar duplicidade (exceto se permitir múltiplas do mesmo usuário, mas aqui validamos se já tem a mesma no streaming)
        const existingSub = await tx.assinatura.findFirst({
            where: {
                participanteId: participante.id,
                streamingId: streaming.id,
                status: { not: "cancelada" }
            }
        });

        if (existingSub && quantidade === 1) {
            throw new Error("Você já possui uma assinatura ativa para este streaming.");
        }

        // 5. Criar Assinatura(s)
        for (let i = 0; i < quantidade; i++) {
            await SubscriptionService.createFromStreaming(tx, participante.id, streaming.id, data.frequencia);
        }

        // 6. Notificar Admin
        await tx.notificacao.create({
            data: {
                contaId: streaming.contaId,
                tipo: "assinatura_criada",
                titulo: "Nova Assinatura Pública",
                descricao: `${data.nome} se inscreveu via link público no streaming ${streaming.apelido || streaming.catalogo.nome}.`,
                metadata: {
                    participanteId: participante.id,
                    streamingId: streaming.id,
                    quantidade
                }
            }
        });

        return { success: true };
    });

    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
}
