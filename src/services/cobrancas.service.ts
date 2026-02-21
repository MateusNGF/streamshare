
import { prisma } from "@/lib/db";
import { uploadComprovante } from "@/lib/storage";
import { billingService } from "./billing-service";
import { StatusCobranca, TipoNotificacao } from "@prisma/client";

export class CobrancasService {
    /**
     * Envia o comprovativo de pagamento e altera o status para aguardando_aprovacao.
     * @param ctx Contexto do utilizador (ID do utilizador e da conta)
     */
    static async enviarComprovativo(cobrancaId: number, file: File, ctx: { userId: number, contaId: number }) {
        // 1. Verificação inicial fora da transação
        const cobranca = await prisma.cobranca.findUnique({
            where: { id: cobrancaId },
            include: { assinatura: { include: { participante: true } } }
        });

        if (!cobranca || cobranca.assinatura.participante.userId !== ctx.userId) {
            return { sucesso: false, erro: "Cobrança não encontrada ou sem permissão." };
        }

        if (cobranca.status === StatusCobranca.pago) {
            return { sucesso: false, erro: "Esta cobrança já foi liquidada." };
        }

        // 2. Upload do ficheiro (Efeito colateral externo)
        let urlComprovante: string;
        try {
            urlComprovante = await uploadComprovante(file, `comprovante_${cobrancaId}_${Date.now()}`);
        } catch (err) {
            console.error("Erro no upload do comprovante:", err);
            return { sucesso: false, erro: "Falha ao processar o arquivo de comprovante." };
        }

        // 3. Transação ACID
        try {
            await prisma.$transaction(async (tx) => {
                const target = await tx.cobranca.findUnique({
                    where: { id: cobrancaId },
                    select: { status: true }
                });

                if (target?.status === StatusCobranca.pago) throw new Error("A cobrança foi paga enquanto o upload ocorria.");

                await tx.cobranca.update({
                    where: { id: cobrancaId },
                    data: {
                        comprovanteUrl: urlComprovante,
                        dataEnvioComprovante: new Date(),
                        status: StatusCobranca.aguardando_aprovacao
                    }
                });

                await tx.notificacao.create({
                    data: {
                        contaId: ctx.contaId,
                        tipo: TipoNotificacao.cobranca_confirmada,
                        titulo: "Novo Comprovante Recebido",
                        descricao: `O participante ${cobranca.assinatura.participante.nome} enviou um comprovante para validação.`,
                        entidadeId: cobrancaId,
                    }
                });
            });

            return { sucesso: true };
        } catch (error: any) {
            return { sucesso: false, erro: error.message || "Erro ao salvar informações do comprovante." };
        }
    }

    /**
     * Aprova o comprovativo e marca a cobrança como paga, disparando efeitos de ativação.
     */
    static async aprovarComprovativo(cobrancaId: number, ctx: { contaId: number }) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const cobranca = await tx.cobranca.findUnique({
                    where: { id: cobrancaId },
                    include: {
                        assinatura: {
                            include: {
                                participante: true,
                                streaming: { include: { catalogo: true } }
                            }
                        }
                    }
                });

                if (!cobranca || cobranca.assinatura.participante.contaId !== ctx.contaId) {
                    throw new Error("Cobrança não encontrada ou acesso negado.");
                }

                if (cobranca.status === StatusCobranca.pago) {
                    throw new Error("Esta cobrança já consta como paga.");
                }

                const updatedCobranca = await tx.cobranca.update({
                    where: { id: cobrancaId },
                    data: {
                        status: StatusCobranca.pago,
                        dataPagamento: new Date(),
                    },
                    include: {
                        assinatura: {
                            include: {
                                participante: true,
                                streaming: { include: { catalogo: true } }
                            }
                        }
                    }
                });

                await billingService.avaliarAtivacaoAposPagamento(tx, {
                    assinatura: updatedCobranca.assinatura,
                    cobranca: updatedCobranca,
                    contaId: ctx.contaId,
                    agora: new Date()
                });

                await tx.notificacao.create({
                    data: {
                        contaId: ctx.contaId,
                        usuarioId: updatedCobranca.assinatura.participante.userId,
                        tipo: TipoNotificacao.cobranca_confirmada, // Não temos 'pagamento_confirmado' em TipoNotificacao
                        titulo: "Pagamento Aprovado",
                        descricao: `Seu pagamento para ${updatedCobranca.assinatura.streaming.catalogo.nome} foi validado com sucesso!`,
                        entidadeId: cobrancaId,
                    }
                });

                return { sucesso: true };
            });

            return result;
        } catch (error: any) {
            console.error("Erro ao aprovar comprovante:", error);
            return { sucesso: false, erro: error.message };
        }
    }

    /**
     * Rejeita o comprovativo e volta o status para pendente.
     */
    static async rejeitarComprovativo(cobrancaId: number, ctx: { contaId: number }) {
        try {
            await prisma.$transaction(async (tx) => {
                const cobranca = await tx.cobranca.findUnique({
                    where: { id: cobrancaId },
                    include: { assinatura: { include: { participante: true } } }
                });

                if (!cobranca || cobranca.assinatura.participante.contaId !== ctx.contaId) {
                    throw new Error("Cobrança não encontrada ou acesso negado.");
                }

                await tx.cobranca.update({
                    where: { id: cobrancaId },
                    data: {
                        status: StatusCobranca.pendente,
                        comprovanteUrl: null,
                        dataEnvioComprovante: null
                    }
                });

                if (cobranca.assinatura.participante.userId) {
                    await tx.notificacao.create({
                        data: {
                            contaId: ctx.contaId,
                            usuarioId: cobranca.assinatura.participante.userId,
                            tipo: TipoNotificacao.cobranca_gerada, // Fallback para alerta de cobrança
                            titulo: "Comprovante Rejeitado",
                            descricao: `Seu comprovante foi rejeitado. Por favor, envie um arquivo válido.`,
                            entidadeId: cobrancaId,
                        }
                    });
                }
            });

            return { sucesso: true };
        } catch (error: any) {
            return { sucesso: false, erro: error.message };
        }
    }
}
