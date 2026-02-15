"use server";

import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento } from "@prisma/client";
import { verifyShareToken } from "@/lib/share-token";

export async function publicSubscribe(data: {
    token: string;
    userId?: number;
    nome: string;
    email: string;
    whatsappNumero: string;
    cpf?: string;
    frequencia?: FrequenciaPagamento;
}) {
    // 1. Validar Streaming
    let streaming;
    const sharePayload = verifyShareToken(data.token);

    if (sharePayload) {
        // If it's a valid share link, allow access by ID (bypass isPublico check)
        streaming = await prisma.streaming.findUnique({
            where: { id: sharePayload.streamingId, isAtivo: true },
            include: {
                conta: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ["ativa", "suspensa"] } }
                        }
                    }
                }
            }
        });
    } else {
        // Fallback to legacy/public token (must be public)
        streaming = await prisma.streaming.findUnique({
            where: { publicToken: data.token, isAtivo: true, isPublico: true },
            include: {
                conta: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ["ativa", "suspensa"] } }
                        }
                    }
                }
            }
        });
    }

    if (!streaming) {
        throw new Error("Streaming não disponível ou link inválido.");
    }

    // 2. Verificar Vagas
    if (streaming._count.assinaturas >= streaming.limiteParticipantes) {
        throw new Error("Não há vagas disponíveis para este streaming.");
    }

    const emailFormatted = data.email.toLowerCase().trim();

    return await prisma.$transaction(async (tx) => {
        // 3. Verificar se o participante já existe na conta
        // Prioridade: userId > CPF > E-mail > WhatsApp
        let participante = await tx.participante.findFirst({
            where: {
                contaId: streaming.contaId,
                OR: [
                    ...(data.userId ? [{ userId: data.userId }] : []),
                    ...(data.cpf ? [{ cpf: data.cpf }] : []),
                    { email: emailFormatted },
                    { whatsappNumero: data.whatsappNumero }
                ]
            }
        });

        if (participante) {
            // Se já existe e está ativo no streaming, erro
            const assinaturaExistente = await tx.assinatura.findFirst({
                where: {
                    participanteId: participante.id,
                    streamingId: streaming.id,
                    status: { not: "cancelada" }
                }
            });

            if (assinaturaExistente) {
                throw new Error("Você já possui uma assinatura ativa para este streaming.");
            }

            // Atualizar dados se necessário e vincular userId se estiver logado
            participante = await tx.participante.update({
                where: { id: participante.id },
                data: {
                    nome: data.nome,
                    whatsappNumero: data.whatsappNumero,
                    cpf: data.cpf || participante.cpf,
                    userId: data.userId || participante.userId // Garante o vínculo do ID
                }
            });
        } else {
            // Criar novo participante com vínculo de usuário
            participante = await tx.participante.create({
                data: {
                    contaId: streaming.contaId,
                    nome: data.nome,
                    email: emailFormatted,
                    whatsappNumero: data.whatsappNumero,
                    cpf: data.cpf || "",
                    userId: data.userId // Vincula ID na criação
                }
            });
        }

        // 4. Criar Assinatura
        await SubscriptionService.createFromStreaming(tx, participante.id, streaming.id, data.frequencia);

        // 5. Notificar Admin (Broadcast)
        await tx.notificacao.create({
            data: {
                contaId: streaming.contaId,
                tipo: "assinatura_criada",
                titulo: "Nova Assinatura Pública",
                descricao: `${data.nome} se inscreveu via link público no streaming ${streaming.apelido || streaming.id}.`,
                metadata: {
                    participanteId: participante.id,
                    streamingId: streaming.id
                }
            }
        });

        return { success: true };
    });

    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
}
