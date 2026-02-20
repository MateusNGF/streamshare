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
    isPrivateInvite?: boolean;
    privateInviteToken?: string;
}) {
    try {
        // 1. Validar Streaming e Token
        const streaming = await StreamingService.validatePublicToken(data.token.trim());

        if (!streaming) {
            return { success: false, error: "Streaming não disponível ou link inválido." };
        }

        // 2. Verificar Vagas
        const quantidade = data.quantidade || 1;
        if (streaming.vagasRestantes < quantidade) {
            return {
                success: false,
                error: streaming.vagasRestantes > 0
                    ? `Não há vagas suficientes. Restam apenas ${streaming.vagasRestantes} vaga(s).`
                    : "Não há vagas disponíveis para este streaming."
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            // 3. Garantir Participante
            const participante = await ParticipantService.findOrCreateParticipant(tx, {
                contaId: streaming.contaId,
                nome: data.nome,
                email: data.email,
                whatsappNumero: data.whatsappNumero,
                userId: data.userId,
                cpf: data.cpf
            });

            // 4. Verificar duplicidade
            const existingSub = await tx.assinatura.findFirst({
                where: {
                    participanteId: participante.id,
                    streamingId: streaming.id,
                    status: { not: "cancelada" }
                }
            });

            if (existingSub && data.quantidade === 1) {
                if (existingSub.status === "pendente") {
                    return {
                        success: false,
                        error: "Você já possui uma inscrição pendente para este streaming. Verifique suas faturas para realizar o pagamento.",
                        code: "PENDING_SUBSCRIPTION"
                    };
                }
                return {
                    success: false,
                    error: "Você já possui uma assinatura ativa para este streaming.",
                    code: "ACTIVE_SUBSCRIPTION"
                };
            }

            // 5. Criar Assinatura(s)
            for (let i = 0; i < (data.quantidade || 1); i++) {
                await SubscriptionService.createFromStreaming(tx, participante.id, streaming.id, data.frequencia);
            }

            // 6. Notificar Admin
            await tx.notificacao.create({
                data: {
                    contaId: streaming.contaId,
                    tipo: "assinatura_criada",
                    titulo: data.isPrivateInvite ? "Nova Assinatura Privada" : "Nova Assinatura Pública",
                    descricao: `${data.nome} se inscreveu ${data.isPrivateInvite ? "por convite" : "via link público"} no streaming ${streaming.apelido || streaming.catalogo.nome}.`,
                    metadata: {
                        participanteId: participante.id,
                        streamingId: streaming.id,
                        quantidade: data.quantidade || 1
                    }
                }
            });

            // 8. Se for um convite privado, marca como aceito
            if (data.isPrivateInvite && data.privateInviteToken && data.userId) {
                const convite = await tx.convite.findUnique({
                    where: { token: data.privateInviteToken }
                });
                if (convite) {
                    await tx.convite.update({
                        where: { id: convite.id },
                        data: { status: "aceito", usuarioId: data.userId }
                    });
                }
            }

            return { success: true };
        });

        if (result.success) {
            revalidatePath("/assinaturas");
            revalidatePath("/participantes");
        }

        return result;
    } catch (error: any) {
        console.error("[PUBLIC_SUBSCRIBE_ERROR]", error);
        return {
            success: false,
            error: error.message || "Ocorreu um erro inesperado ao processar sua inscrição."
        };
    }
}
