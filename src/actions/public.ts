"use server";

import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, MetodoPagamento } from "@prisma/client";
import { StreamingService } from "@/services/streaming.service";
import { ParticipantService } from "@/services/participant.service";
import { createPixPayment, createCheckoutPreference } from "@/lib/mercado-pago";

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
            const assinaturas = [];
            for (let i = 0; i < (data.quantidade || 1); i++) {
                const ass = await SubscriptionService.createFromStreaming(tx, participante.id, streaming.id, data.frequencia);
                assinaturas.push(ass);
            }

            const primeiraAssinatura = assinaturas[0];
            const valorTotalCiclo = Number(primeiraAssinatura.valor) * (data.quantidade || 1);

            // 6. Gerar Pagamento Inicial no Gateway (PIX ou CARTÃO)
            let checkoutData = null;
            if (data.metodoPagamento === MetodoPagamento.PIX) {
                const res = await createPixPayment({
                    id: `pub_sub_${primeiraAssinatura.id}`,
                    title: `Assinatura ${streaming.catalogo.nome}`,
                    description: `Inscrição para ${data.nome}`,
                    unit_price: valorTotalCiclo,
                    email: data.email,
                    external_reference: `assinatura_${primeiraAssinatura.id}`
                });

                if (res.success) {
                    // Buscar a cobrança gerada pelo SubscriptionService (createFromStreaming gera cobrança inicial)
                    // Como o SubscriptionService gera uma cobrança para cada assinatura, precisamos atualizar as cobranças iniciais
                    // Para simplificar, o checkout público foca na primeira assinatura (o lote é menos comum aqui)
                    await tx.cobranca.updateMany({
                        where: { assinaturaId: { in: assinaturas.map(a => a.id) }, status: 'pendente' },
                        data: {
                            metodoPagamento: MetodoPagamento.PIX,
                            gatewayId: res.id,
                            gatewayProvider: 'mercadopago',
                            pixQrCode: res.qr_code_base64,
                            pixCopiaECola: res.qr_code
                        }
                    });

                    checkoutData = {
                        type: 'PIX',
                        qrCode: res.qr_code_base64,
                        copyPaste: res.qr_code
                    };
                }
            } else if (data.metodoPagamento === MetodoPagamento.CREDIT_CARD) {
                const res = await createCheckoutPreference({
                    id: `pub_sub_${primeiraAssinatura.id}`,
                    title: `Assinatura ${streaming.catalogo.nome}`,
                    description: `Inscrição para ${data.nome}`,
                    unit_price: valorTotalCiclo,
                    email: data.email,
                    external_reference: `assinatura_${primeiraAssinatura.id}`
                });

                if (res.success) {
                    await tx.cobranca.updateMany({
                        where: { assinaturaId: { in: assinaturas.map(a => a.id) }, status: 'pendente' },
                        data: {
                            metodoPagamento: MetodoPagamento.CREDIT_CARD,
                            gatewayProvider: 'mercadopago'
                        }
                    });

                    checkoutData = {
                        type: 'CARD',
                        url: res.init_point
                    };
                }
            }

            // 7. Notificar Admin
            await tx.notificacao.create({
                data: {
                    contaId: streaming.contaId,
                    tipo: "assinatura_criada",
                    titulo: data.isPrivateInvite ? "Nova Assinatura Privada" : "Nova Assinatura Pública",
                    descricao: `${data.nome} se inscreveu ${data.isPrivateInvite ? "por convite" : "via link público"} no streaming ${streaming.apelido || streaming.catalogo.nome}.`,
                    metadata: {
                        participanteId: participante.id,
                        streamingId: streaming.id,
                        quantidade: data.quantidade || 1,
                        metodo: data.metodoPagamento
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
