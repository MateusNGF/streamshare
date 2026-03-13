import { prisma, PrismaTransactionClient } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { billingService } from "./billing-service";
import { startOfMonth, endOfMonth, parse, format, addDays, addHours } from "date-fns";

export interface LoteActor {
    userId: number;
    contaId?: number;
    isAdmin: boolean;
    isAdminView?: boolean; // Se a ação vem da visão de admin/organizador
}

export class LotePagamentoService {
    /**
     * Auxiliar reusável: processa criação de um lote com transaction isolation
     */
    private static async _processarParticipanteIsolado(pId: number, pContaId: number, refMes: string, cbdsIds: number[], valorTotalObj: Prisma.Decimal) {
        return await prisma.$transaction(async (tx) => {
            // Check if there is already a lote for this month
            const alreadyExists = await tx.lotePagamento.findUnique({
                where: {
                    participanteId_referenciaMes_contaId: {
                        participanteId: pId,
                        referenciaMes: refMes,
                        contaId: pContaId
                    }
                }
            });

            if (alreadyExists) return null;

            // Verify if charges are still available (Concurrency Check)
            const chargesStillAvailableCount = await tx.cobranca.count({
                where: {
                    id: { in: cbdsIds },
                    lotePagamentoId: null,
                    status: { in: ["pendente", "atrasado"] }
                }
            });

            if (chargesStillAvailableCount !== cbdsIds.length) {
                return null; // Some charges were paid or batched concurrently, abort
            }

            // Create the batch
            const expiresAt = addDays(new Date(), 10);

            const novoLote = await tx.lotePagamento.create({
                data: {
                    participanteId: pId,
                    contaId: pContaId,
                    referenciaMes: refMes,
                    valorTotal: valorTotalObj,
                    status: "pendente",
                    expiresAt
                }
            });

            await tx.cobranca.updateMany({
                where: { id: { in: cbdsIds } },
                data: { lotePagamentoId: novoLote.id }
            });

            return novoLote.id;
        });
    }

    /**
     * Analisa as cobranças pendentes para gerar o resumo da consolidação.
     */
    static async analisarFaturasMensais(contaId: number, referenciaMes?: string) {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (referenciaMes !== 'all') {
            const agora = new Date();
            const refMes = referenciaMes || format(agora, 'yyyy-MM');
            const referenceDate = parse(refMes, 'yyyy-MM', new Date());

            startDate = startOfMonth(referenceDate);
            endDate = endOfMonth(referenceDate);
        }

        const whereClause: any = {
            status: {
                in: ["pendente", "atrasado"]
            },
            lotePagamentoId: null,
            assinatura: {
                participante: {
                    contaId,
                }
            }
        };

        if (startDate && endDate) {
            whereClause.periodoFim = {
                gte: startDate,
                lte: endDate,
            };
        }

        const cobrancasElegiveis = await prisma.cobranca.findMany({
            where: whereClause,
            select: {
                id: true,
                valor: true,
                assinatura: {
                    select: {
                        participanteId: true
                    }
                }
            }
        });

        const totalPrevisto = cobrancasElegiveis.reduce((acc, c) => acc + Number(c.valor), 0);
        const participantesUnicos = new Set(cobrancasElegiveis.map(c => c.assinatura.participanteId));

        return {
            countCobrancas: cobrancasElegiveis.length,
            countParticipantes: participantesUnicos.size,
            totalPrevisto
        };
    }

    /**
     * Automatiza a criação de lotes mensais agrupando faturas do mesmo participante.
     */
    static async consolidarFaturasMensais(contaId?: number, referenciaMes?: string) {
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        let refMesForBatch = referenciaMes || format(new Date(), 'yyyy-MM');

        if (referenciaMes !== 'all') {
            const referenceDate = parse(refMesForBatch, 'yyyy-MM', new Date());
            startDate = startOfMonth(referenceDate);
            endDate = endOfMonth(referenceDate);
        } else {
            // If "all", we label the batch with the current month generically to mark when it was grouped
            refMesForBatch = format(new Date(), 'yyyy-MM');
        }

        const lotesCriados: number[] = [];

        // Find all eligible charges for this month (Read operation outside transaction)
        const whereClause: any = {
            status: { in: ["pendente", "atrasado"] },
            lotePagamentoId: null,
        };

        if (startDate && endDate) {
            whereClause.periodoFim = { gte: startDate, lte: endDate };
        }

        if (contaId) {
            whereClause.assinatura = {
                participante: { contaId }
            };
        }

        const cobrancas = await prisma.cobranca.findMany({
            where: whereClause,
            include: {
                assinatura: { include: { participante: true } }
            }
        });

        if (cobrancas.length === 0) return { consolidados: 0, lotes: [] };

        // Group by participanteId
        const porParticipante = cobrancas.reduce((acc, c) => {
            const pId = c.assinatura.participanteId;
            if (!acc[pId]) acc[pId] = [];
            acc[pId].push(c);
            return acc;
        }, {} as Record<number, typeof cobrancas>);

        // Process each participant in an isolated ACID transaction
        for (const [pIdStr, items] of Object.entries(porParticipante)) {
            const pId = Number(pIdStr);
            const pContaId = items[0].assinatura.participante.contaId;
            const cobrancaIds = items.map(i => i.id);
            const valorTotal = items.reduce((sum, c) => sum.plus(c.valor), new Prisma.Decimal(0));

            try {
                const newLoteId = await this._processarParticipanteIsolado(pId, pContaId, refMesForBatch, cobrancaIds, valorTotal);
                if (newLoteId) lotesCriados.push(newLoteId);
            } catch (error) {
                console.error(`[LOTE_SERVICE] Erro ao consolidar fatura do participante ${pId}:`, error);
                // Continue with the next participant despite failure (Isolation)
            }
        }

        return { consolidados: lotesCriados.length, lotes: lotesCriados };
    }

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

            const participante = (cobrancas[0] as any).assinatura.participante;
            const participanteId = participante.id;
            const contaId = participante.contaId;
            const differentParticipant = cobrancas.some(c => (c as any).assinatura.participanteId !== participanteId);
            if (differentParticipant) {
                throw new Error("Todas as cobranças devem ser do mesmo participante para pagamento em lote.");
            }

            const valorTotal = cobrancas.reduce((sum, c) => sum.plus(c.valor), new Prisma.Decimal(0));
            const expiresAt = addHours(new Date(), 24);

            const lote = await tx.lotePagamento.create({
                data: {
                    participanteId,
                    contaId,
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
    static async confirmarLote(tx: PrismaTransactionClient, loteId: number, comprovanteUrl: string, actor: LoteActor) {
        const lote = await tx.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: { include: { conta: true } }, cobrancas: true }
        });

        if (!lote) throw new Error("Lote não encontrado.");

        const isOwner = lote.participante.userId === actor.userId;
        const canConfirm = isOwner || (actor.isAdmin && lote.participante.contaId === actor.contaId);

        if (!canConfirm) throw new Error("Acesso negado.");
        if (lote.status === "pago") throw new Error("O lote já foi pago.");

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
    }

    /**
     * Aprova e liquida um lote de pagamento e todas as suas faturas vinculadas.
     */
    static async aprovarLote(tx: PrismaTransactionClient, loteId: number, actor: LoteActor) {
        this.ensureAdminAccess(actor);

        const lote = await tx.lotePagamento.findUnique({
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

        // Notificações externas (E-mail / WhatsApp) via Serviço Especializado (SRP)
        if (actor.contaId) {
            import("./lote-notification.service").then(({ LoteNotificationService }) => {
                LoteNotificationService.notifyAprovado(loteId, actor.contaId!);
            });
        }

        return updatedLote;
    }

    private static ensureAdminAccess(actor: LoteActor): void {
        if (!actor.isAdmin || !actor.contaId) {
            throw new Error("Acesso negado - Não é administrador.");
        }
    }

    /**
     * Rejeita o lote (comprovante inválido) e notifica o usuário.
     */
    static async rejeitarLote(tx: PrismaTransactionClient, loteId: number, motivo: string, actor: LoteActor) {
        this.ensureAdminAccess(actor);

        const lote = await tx.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: true }
        });

        if (!lote || lote.participante.contaId !== actor.contaId) {
            throw new Error("Lote não encontrado ou acesso negado.");
        }

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

        // Notificações externas
        if (actor.contaId) {
            const { LoteNotificationService } = await import("./lote-notification.service");
            LoteNotificationService.notifyRejeitado(loteId, actor.contaId, motivo);
        }

        return updated;
    }

    /**
     * Cancela o lote, devolvendo as faturas ao status puramente pendente.
     */
    static async cancelarLote(tx: PrismaTransactionClient, loteId: number, motivo: string, actor: LoteActor) {
        const lote = await tx.lotePagamento.findUnique({
            where: { id: loteId },
            include: { participante: { include: { usuario: true } }, cobrancas: { include: { assinatura: { include: { streaming: { include: { catalogo: true } } } } } } }
        });

        if (!lote) throw new Error("Lote não encontrado.");
        const { isOwner, isAdminOfAccount } = this.ensureAdminOrOwner(lote, actor);

        if (lote.status !== "pendente" && lote.status !== "aguardando_aprovacao") {
            throw new Error("Apenas lotes pendentes ou aguardando aprovação podem ser cancelados.");
        }
        if (isAdminOfAccount && !isOwner && !motivo) {
            throw new Error("O cancelamento administrativo exige um motivo.");
        }

        const servicos = lote.cobrancas.map((c: any) => c.assinatura.streaming.apelido || (c.assinatura.streaming.catalogo as any).nome).join(", ");

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
