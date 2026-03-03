"use server";

import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, StatusConvite, TipoNotificacao } from "@prisma/client";
import { StreamingService } from "@/services/streaming.service";
import { ParticipantService } from "@/services/participant.service";
import { InviteService } from "@/services/invite.service";

export async function publicSubscribe(data: {
    token?: string;
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
        let streaming;
        const quantidade = data.quantidade || 1;

        if (data.isPrivateInvite && data.privateInviteToken) {
            // 1a. Validar via InviteService para convites privados
            const convite = await InviteService.validateInviteForAcceptance(data.privateInviteToken);
            if (!convite.streaming) throw new Error("Este convite não está vinculado a um streaming.");

            // Note: validateInviteForAcceptance already checks spots
            streaming = convite.streaming;
        } else if (data.token) {
            // 1b. Validar via StreamingService para links públicos
            streaming = await StreamingService.validatePublicToken(data.token.trim());
            if (!streaming) throw new Error("Streaming não disponível ou link inválido.");

            // Validar capacidade via Centralized Service
            await StreamingService.ensureCapacity(streaming.id, quantidade);
        }

        if (!streaming) throw new Error("Informações de streaming insuficientes.");

        const result = await prisma.$transaction(async (tx) => {
            // 2. Garantir Participante
            const participante = await ParticipantService.findOrCreateParticipant(tx, {
                contaId: streaming.contaId,
                nome: data.nome,
                email: data.email,
                whatsappNumero: data.whatsappNumero,
                userId: data.userId,
                cpf: data.cpf
            });

            // 3. Verificar duplicidade
            const existingSub = await tx.assinatura.findFirst({
                where: {
                    participanteId: participante.id,
                    streamingId: streaming.id,
                    status: { not: "cancelada" }
                }
            });

            if (existingSub && quantidade === 1) {
                if (existingSub.status === "pendente") {
                    throw new Error("Você já possui uma inscrição pendente para este streaming.");
                }
                throw new Error("Você já possui uma assinatura ativa para este streaming.");
            }

            // 4. Criar Assinatura(s)
            for (let i = 0; i < quantidade; i++) {
                await SubscriptionService.createFromStreaming(tx, participante.id, streaming.id, data.frequencia);
            }

            // 5. Side effect: marcar convite privado como aceito
            if (data.isPrivateInvite && data.privateInviteToken && data.userId) {
                await tx.convite.updateMany({
                    where: { token: data.privateInviteToken, status: StatusConvite.pendente },
                    data: { status: StatusConvite.aceito, usuarioId: data.userId }
                });
            }

            // 6. Gerenciar lotação
            await InviteService.handleStreamingFull(streaming.id, tx);

            // 7. Notificar Admin
            await tx.notificacao.create({
                data: {
                    contaId: streaming.contaId,
                    tipo: TipoNotificacao.assinatura_criada,
                    titulo: data.isPrivateInvite ? "Nova Assinatura Privada" : "Nova Assinatura Pública",
                    descricao: `${data.nome} se inscreveu ${data.isPrivateInvite ? "por convite" : "via link público"} no streaming ${streaming.apelido || (streaming as any).catalogo?.nome}.`,
                    metadata: { participanteId: participante.id, streamingId: streaming.id, quantidade }
                }
            });

            return {
                participanteId: participante.id,
                streamingId: streaming.id,
                quantidade
            };
        });

        revalidatePath("/assinaturas");
        revalidatePath("/participantes");

        return { success: true, data: result };
    } catch (error: any) {
        console.error("[PUBLIC_SUBSCRIBE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao processar sua inscrição." };
    }
}
