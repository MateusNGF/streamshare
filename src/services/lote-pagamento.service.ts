import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { billingService } from "./billing-service";

export interface LoteActor {
    userId: number;
    contaId?: number;
    isAdmin: boolean;
    isAdminView?: boolean; // Se a ação vem da visão de admin/organizador
}

export class LotePagamentoService {
    /**
     * Cria um lote de pagamento contendo múltiplas cobranças pendentes do mesmo participante.
     */
    static async criarLote(cobrancaIds: number[], actor: LoteActor) {
        if (!cobrancaIds || cobrancaIds.length === 0) {
            throw new Error("Nenhuma cobrança selecionada.");
        }

        return await prisma.$transaction(async (tx) => {
            const cobrancas = await tx.cobranca.findMany({
                where: {
                    id: { in: cobrancaIds },
                    status: { in: ["pendente", "atrasado"] },
                    lotePagamentoId: null,
                    assinatura: actor.isAdminView
                        ? { participante: { contaId: actor.contaId } }
                        : { participante: { userId: actor.userId } }
                },
                include: {
                    assinatura: { include: { participante: true } }
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

            const lote = await tx.lotePagamento.create({
                data: {
                    participanteId,
                    valorTotal,
                    status: "pendente",
                    expiresAt,
                }
            });

            const updateResult = await tx.cobranca.updateMany({
                where: {
                    id: { in: cobrancaIds },
                    lotePagamentoId: null,
                    status: { in: ["pendente", "atrasado"] }
                },
                data: {
                    lotePagamentoId: lote.id
                }
            });

            if (updateResult.count !== cobrancaIds.length) {
                throw new Error("Concorrência detectada: algumas cobranças foram modificadas durante a criação do lote.");
            }

            return await tx.lotePagamento.findUniqueOrThrow({
                where: { id: lote.id },
                include: {
                    participante: { include: { conta: true } },
                    cobrancas: { include: { assinatura: { include: { streaming: { include: { catalogo: true } } } } } }
                }
            });
        });
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
        this.ensureAdminAccess(actor);

        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: {
                participante: true,
                cobrancas: {
                    include: {
                        assinatura: { include: { participante: true, streaming: { include: { catalogo: true } } } }
                    }
                }
            }
        });

        if (!lote || lote.participante.contaId !== actor.contaId) {
            throw new Error("Lote não encontrado ou acesso negado.");
        }

        if (lote.status === "pago") {
            throw new Error("O Lote já está pago.");
        }

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

        // Notificações externas (E-mail / WhatsApp) via Serviço Especializado (SRP)
        if (actor.contaId) {
            const { LoteNotificationService } = await import("./lote-notification.service");
            LoteNotificationService.notifyAprovado(loteId, actor.contaId);
        }

        return txResult;
    }

    private static ensureAdminAccess(actor: LoteActor) {
        if (!actor.isAdmin || !actor.contaId) {
            throw new Error("Acesso negado - Não é administrador.");
        }
    }

    /**
     * Rejeita o lote (comprovante inválido) e notifica o usuário.
     */
    static async rejeitarLote(loteId: number, actor: LoteActor, motivo?: string) {
        this.ensureAdminAccess(actor);

        const lote = await prisma.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: true }
        });

        if (!lote || lote.participante.contaId !== actor.contaId) {
            throw new Error("Lote não encontrado ou acesso negado.");
        }

        const upLote = await prisma.$transaction(async (tx) => {
            const updated = await tx.lotePagamento.update({
                where: { id: loteId },
                data: {
                    status: "pendente",
                    comprovanteUrl: null,
                    motivoRejeicao: motivo
                }
            });

            if (lote.participante.userId && actor.contaId) {
                await tx.notificacao.create({
                    data: {
                        contaId: actor.contaId,
                        usuarioId: lote.participante.userId,
                        tipo: "cobranca_cancelada",
                        titulo: "Lote Rejeitado",
                        descricao: `Seu comprovante do Lote #${lote.id} foi rejeitado. Motivo: ${motivo || 'Verifique o comprovante enviado.'}`,
                        entidadeId: lote.id,
                        lida: false
                    }
                });
            }

            return updated;
        });

        // Notificações externas
        if (actor.contaId) {
            const { LoteNotificationService } = await import("./lote-notification.service");
            LoteNotificationService.notifyRejeitado(loteId, actor.contaId, motivo);
        }

        return upLote;
    }

    /**
     * Cancela o lote, devolvendo as faturas ao status puramente pendente.
     */
    static async cancelarLote(loteId: number, actor: LoteActor, motivo?: string) {
        const lote = await prisma.lotePagamento.findUniqueOrThrow({
            where: { id: loteId },
            include: {
                participante: { include: { usuario: true } },
                cobrancas: { include: { assinatura: { include: { streaming: { include: { catalogo: true } } } } } }
            }
        });

        const { isOwner, isAdminOfAccount } = this.ensureAdminOrOwner(lote, actor);

        if (lote.status !== "pendente" && lote.status !== "aguardando_aprovacao") {
            throw new Error("Apenas lotes pendentes ou aguardando aprovação podem ser cancelados.");
        }
        if (isAdminOfAccount && !isOwner && !motivo) {
            throw new Error("O cancelamento administrativo exige um motivo.");
        }

        const servicos = lote.cobrancas.map(c => c.assinatura.streaming.apelido || (c.assinatura.streaming.catalogo as any).nome).join(", ");

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
                        descricao: `O Lote #${loteId} (${servicos}) foi cancelado. Motivo: ${motivo}`,
                        entidadeId: loteId,
                        lida: false
                    }
                });
            }

            return upLote;
        });
    }

    private static ensureAdminOrOwner(lote: any, actor: LoteActor) {
        const isOwner = lote.participante.userId === actor.userId;
        const isAdminOfAccount = actor.isAdmin && lote.participante.contaId === actor.contaId;

        if (!isOwner && !isAdminOfAccount) {
            throw new Error("Sem permissão para realizar esta ação neste lote.");
        }
        return { isOwner, isAdminOfAccount };
    }
}
