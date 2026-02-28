import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { billingService } from "./billing-service";

export interface LoteActor {
    userId: number;
    contaId?: number;
    isAdmin: boolean;
}

export class LotePagamentoService {
    /**
     * Cria um lote de pagamento contendo múltiplas cobranças pendentes do mesmo participante.
     */
    static async criarLote(cobrancaIds: number[], actor: LoteActor) {
        if (!cobrancaIds || cobrancaIds.length === 0) {
            throw new Error("Nenhuma cobrança selecionada.");
        }

        const cobrancas = await prisma.cobranca.findMany({
            where: {
                id: { in: cobrancaIds },
                status: { in: ["pendente", "atrasado"] },
                lotePagamentoId: null,
                assinatura: {
                    participante: actor.contaId
                        ? { contaId: actor.contaId }
                        : { userId: actor.userId }
                }
            },
            include: {
                assinatura: { include: { participante: true, streaming: { include: { catalogo: true } } } }
            }
        });

        if (cobrancas.length === 0) {
            throw new Error("Nenhuma cobrança pendente e livre de lotes foi encontrada.");
        }

        if (cobrancas.length !== cobrancaIds.length) {
            throw new Error("Algumas cobranças selecionadas já foram pagas ou pertencem a outro lote.");
        }

        const participanteId = (cobrancas[0] as any).assinatura.participanteId;
        const differentParticipant = cobrancas.some(c => (c as any).assinatura.participanteId !== participanteId);
        if (differentParticipant) {
            throw new Error("Todas as cobranças devem ser do mesmo participante para pagamento em lote.");
        }

        const valorTotal = cobrancas.reduce((sum, c) => sum.plus(c.valor), new Prisma.Decimal(0));
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const lote = await prisma.lotePagamento.create({
            data: {
                participanteId,
                valorTotal,
                status: "pendente",
                expiresAt,
                cobrancas: {
                    connect: cobrancas.map(c => ({ id: c.id }))
                }
            },
            include: {
                participante: { include: { conta: true } },
                cobrancas: { include: { assinatura: { include: { streaming: { include: { catalogo: true } } } } } }
            }
        });

        return lote;
    }

    /**
     * Confirma o envio de um comprovante para um lote de pagamento inteiro.
     */
    static async confirmarLote(loteId: number, comprovanteUrl: string, actor: LoteActor) {
        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: { include: { conta: true } }, cobrancas: true }
        });

        if (!lote) throw new Error("Lote não encontrado.");

        const isOwner = lote.participante.userId === actor.userId;
        const canConfirm = isOwner || (actor.isAdmin && lote.participante.contaId === actor.contaId);

        if (!canConfirm) throw new Error("Acesso negado.");
        if (lote.status === "pago") throw new Error("O lote já foi pago.");

        return await prisma.$transaction(async (tx) => {
            const currentLote = await tx.lotePagamento.findUnique({
                where: { id: loteId },
                select: { status: true }
            });

            if (currentLote?.status === "pago") throw new Error("O lote foi fechado enquanto o upload ocorria.");

            const updatedLote = await tx.lotePagamento.update({
                where: { id: loteId },
                data: {
                    status: "aguardando_aprovacao",
                    comprovanteUrl
                }
            });

            await tx.cobranca.updateMany({
                where: { lotePagamentoId: loteId },
                data: {
                    status: "aguardando_aprovacao",
                    comprovanteUrl: comprovanteUrl,
                    dataEnvioComprovante: new Date(),
                }
            });

            if (actor.contaId && lote.participante.userId === actor.userId) {
                await tx.notificacao.create({
                    data: {
                        contaId: actor.contaId,
                        tipo: "cobranca_confirmada",
                        titulo: "Pagamento de Lote Recebido",
                        descricao: `O participante ${lote.participante.nome} enviou um comprovante para o Lote #${loteId}.`,
                        entidadeId: loteId,
                        lida: false
                    }
                });
            }

            return updatedLote;
        });
    }

    /**
     * Aprova e liquida um lote de pagamento e todas as suas faturas vinculadas.
     */
    static async aprovarLote(loteId: number, actor: LoteActor) {
        if (!actor.isAdmin || !actor.contaId) throw new Error("Acesso negado - Não é administrador.");

        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: {
                participante: { include: { usuario: true } },
                cobrancas: {
                    include: {
                        assinatura: { include: { participante: true, streaming: { include: { catalogo: true } } } }
                    }
                }
            }
        });

        if (!lote || lote.participante.contaId !== actor.contaId) throw new Error("Lote não encontrado ou acesso negado.");
        if (lote.status === "pago") throw new Error("O Lote já está pago.");

        const txResult = await prisma.$transaction(async (tx) => {
            const updatedLote = await tx.lotePagamento.update({
                where: { id: loteId },
                data: { status: "pago" }
            });

            const dataPagamento = new Date();
            await tx.cobranca.updateMany({
                where: { lotePagamentoId: loteId },
                data: {
                    status: "pago",
                    dataPagamento
                }
            });

            // Processar renovacoes e notificacoes individualmente para o lote
            for (const c of lote.cobrancas) {
                const refreshedCobranca = await tx.cobranca.findUnique({
                    where: { id: c.id },
                    include: { assinatura: { include: { participante: true, streaming: { include: { catalogo: true } } } } }
                });

                if (refreshedCobranca && actor.contaId) {
                    await billingService.avaliarAtivacaoAposPagamento(tx, {
                        assinatura: refreshedCobranca.assinatura,
                        cobranca: refreshedCobranca,
                        contaId: actor.contaId,
                        agora: dataPagamento
                    });
                }
            }

            if (lote.participante.userId && actor.contaId) {
                await tx.notificacao.create({
                    data: {
                        contaId: actor.contaId,
                        usuarioId: lote.participante.userId,
                        tipo: "cobranca_confirmada",
                        titulo: "Lote de Pagamento Aprovado",
                        descricao: `Seu pagamento do Lote #${lote.id} foi validado. As faturas foram dadas como pagas.`,
                        entidadeId: lote.id,
                        lida: false
                    }
                });
            }

            return updatedLote;
        });

        // Efeitos colaterais (WhatsApp / E-mail) fora da transação
        const pEmail = lote.participante.usuario?.email || lote.participante.email;

        // E-mail
        if (pEmail) {
            try {
                const { sendLoteAprovadoEmail } = await import("@/lib/email");
                const { formatCurrency } = await import("@/lib/formatCurrency");
                const pConta = await prisma.conta.findUnique({ where: { id: actor.contaId }, select: { moedaPreferencia: true } });
                const valorMoeda = formatCurrency(lote.valorTotal.toNumber(), (pConta?.moedaPreferencia as any) || 'BRL');

                await sendLoteAprovadoEmail({
                    to: pEmail,
                    participanteNome: lote.participante.nome,
                    loteId: lote.id,
                    quantidadeItens: lote.cobrancas.length,
                    valorTotal: valorMoeda
                });
            } catch (err) {
                console.error("[EMAIL_LOTE_APROVADO_ERROR]", err);
            }
        }

        // WhatsApp
        if (lote.participante.whatsappNumero) {
            try {
                const { sendWhatsAppNotification, whatsappConfigIsValid, whatsappTemplates } = await import("@/lib/whatsapp-service");
                const configId = await whatsappConfigIsValid(actor.contaId);

                if (configId) {
                    const { formatCurrency } = await import("@/lib/formatCurrency");
                    const pConta = await prisma.conta.findUnique({ where: { id: actor.contaId }, select: { moedaPreferencia: true } });
                    const valorMoeda = formatCurrency(lote.valorTotal.toNumber(), (pConta?.moedaPreferencia as any) || 'BRL');
                    const templateMsg = whatsappTemplates.loteAprovado(lote.participante.nome, lote.cobrancas.length.toString(), valorMoeda);

                    await sendWhatsAppNotification(actor.contaId, "pagamento_confirmado" as any, lote.participanteId, templateMsg);
                }
            } catch (err) {
                console.error("[WHATSAPP_LOTE_ERROR]", err);
            }
        }

        return txResult;
    }

    /**
     * Rejeita o comprovante de um lote, exigindo que o usuario anexe outro.
     */
    static async rejeitarLote(loteId: number, actor: LoteActor, motivo?: string) {
        if (!actor.isAdmin || !actor.contaId) throw new Error("Acesso negado - Não é administrador.");

        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: { include: { usuario: true } }, cobrancas: true }
        });

        if (!lote || lote.participante.contaId !== actor.contaId) throw new Error("Lote não encontrado ou acesso negado.");

        const txResult = await prisma.$transaction(async (tx) => {
            const upLote = await tx.lotePagamento.update({
                where: { id: loteId },
                data: {
                    status: "pendente",
                    comprovanteUrl: null,
                    motivoRejeicao: motivo || null
                }
            });

            await tx.cobranca.updateMany({
                where: { lotePagamentoId: loteId },
                data: {
                    status: "pendente",
                    comprovanteUrl: null,
                    dataEnvioComprovante: null
                }
            });

            await tx.notificacao.create({
                data: {
                    contaId: actor.contaId!,
                    usuarioId: null, // Broadcast to admins
                    tipo: "cobranca_cancelada",
                    titulo: "Lote Rejeitado",
                    descricao: `O comprovante do Lote #${loteId} foi rejeitado. Motivo: ${motivo || "Comprovante inválido."}`,
                    entidadeId: loteId,
                    lida: false
                }
            });

            return upLote;
        });

        const pEmail = lote.participante.usuario?.email || lote.participante.email;
        const motivoFinal = motivo || "Comprovante inválido ou ilegível.";

        // E-mail
        if (pEmail) {
            try {
                const { sendLoteRejeitadoEmail } = await import("@/lib/email");
                await sendLoteRejeitadoEmail({
                    to: pEmail,
                    participanteNome: lote.participante.nome,
                    loteId: lote.id,
                    motivo: motivoFinal
                });
            } catch (err) {
                console.error("[EMAIL_LOTE_REJEITADO_ERROR]", err);
            }
        }

        // WhatsApp
        if (lote.participante.whatsappNumero) {
            try {
                const { sendWhatsAppNotification, whatsappConfigIsValid } = await import("@/lib/whatsapp-service");
                const configId = await whatsappConfigIsValid(actor.contaId);
                if (configId) {
                    const msg = `⚠️ Olá ${lote.participante.nome}, seu lote #${lote.id} foi rejeitado.\n\nMotivo: ${motivoFinal}\n\nPor favor, envie um novo comprovante pelo painel.`;
                    await sendWhatsAppNotification(actor.contaId, "cobranca_atrasada" as any, lote.participanteId, {
                        texto: msg,
                        template: { name: "cobranca_atrasada", language: "pt_BR", components: [] } as any
                    });
                }
            } catch (err) {
                console.error("[WHATSAPP_LOTE_REJEITADO_ERROR]", err);
            }
        }

        return txResult;
    }

    /**
     * Cancela o lote, devolvendo as faturas ao status puramente pendente.
     */
    static async cancelarLote(loteId: number, actor: LoteActor, motivo?: string) {
        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: { include: { usuario: true } } }
        });

        if (!lote) throw new Error("Lote não encontrado.");

        const isOwner = lote.participante.userId === actor.userId;
        const canCancel = isOwner || (actor.isAdmin && lote.participante.contaId === actor.contaId);

        if (!canCancel) throw new Error("Sem permissão para cancelar este lote.");
        if (lote.status !== "pendente" && lote.status !== "aguardando_aprovacao") {
            throw new Error("Apenas lotes pendentes ou aguardando aprovação podem ser cancelados.");
        }
        if (actor.isAdmin && !isOwner && !motivo) {
            throw new Error("O cancelamento administrativo exige um motivo.");
        }

        return await prisma.$transaction(async (tx) => {
            const upLote = await tx.lotePagamento.update({
                where: { id: loteId },
                data: { status: "cancelado" }
            });

            await tx.cobranca.updateMany({
                where: { lotePagamentoId: loteId },
                data: {
                    lotePagamentoId: null,
                    comprovanteUrl: null,
                    dataEnvioComprovante: null,
                    status: "pendente"
                }
            });

            if (actor.isAdmin && !isOwner && lote.participante.userId && actor.contaId) {
                await tx.notificacao.create({
                    data: {
                        contaId: actor.contaId,
                        usuarioId: lote.participante.userId,
                        tipo: "cobranca_cancelada",
                        titulo: "Lote Cancelado pelo Administrador",
                        descricao: `O Lote #${loteId} foi cancelado. Motivo: ${motivo}`,
                        entidadeId: loteId,
                        lida: false
                    }
                });
            }

            return upLote;
        });
    }
}
