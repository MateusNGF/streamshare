"use server";

import { prisma } from "@/lib/db";
import { getContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PLANS } from "@/config/plans";
import type { CurrencyCode } from "@/types/currency.types";
import { criarNotificacao } from "@/actions/notificacoes";

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Lista todos os grupos da conta com contagem de streamings
 */
export async function getGrupos() {
    try {
        const { contaId } = await getContext();

        const data = await prisma.grupo.findMany({
            where: { contaId, isAtivo: true },
            include: {
                streamings: {
                    where: { isAtivo: true },
                    include: {
                        streaming: {
                            include: { catalogo: true }
                        }
                    }
                },
                _count: {
                    select: { streamings: true }
                }
            },
            orderBy: { nome: "asc" },
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_GRUPOS_ERROR]", error);
        return { success: false, error: "Erro ao buscar grupos" };
    }
}

/**
 * Busca um grupo específico com todos os seus streamings e assinaturas
 */
export async function getGrupoById(id: number) {
    try {
        const { contaId } = await getContext();

        const grupo = await prisma.grupo.findFirst({
            where: { id, contaId, isAtivo: true },
            include: {
                streamings: {
                    where: { isAtivo: true },
                    include: {
                        streaming: {
                            include: {
                                catalogo: true,
                                assinaturas: {
                                    where: {
                                        status: { in: ["ativa", "suspensa"] }
                                    },
                                    include: {
                                        participante: true,
                                        cobrancas: {
                                            orderBy: { periodoFim: "desc" },
                                            take: 1
                                        }
                                    },
                                    orderBy: { createdAt: "asc" }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!grupo) {
            return { success: false, error: "Grupo não encontrado ou sem permissão" };
        }

        return { success: true, data: grupo };
    } catch (error: any) {
        console.error("[GET_GRUPO_BY_ID_ERROR]", error);
        return { success: false, error: "Erro ao buscar grupo" };
    }
}

/**
 * Cria um novo grupo vinculando os streamings selecionados
 */
export async function createGrupo(data: {
    nome: string;
    descricao?: string;
    streamingIds: number[];
}) {
    try {
        const { contaId, userId } = await getContext();

        // 1. Validate Plan Limits
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        // Validações
        if (!data.nome || !data.nome.trim()) {
            return { success: false, error: "Nome é obrigatório" };
        }

        if (!data.streamingIds || data.streamingIds.length === 0) {
            return { success: false, error: "Selecione pelo menos um streaming" };
        }

        // Gerar link de convite único
        const linkConvite = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const grupo = await prisma.$transaction(async (tx) => {
            // Verificar se os streamings pertencem à conta
            const streamingsValidos = await tx.streaming.count({
                where: {
                    id: { in: data.streamingIds },
                    contaId,
                    isAtivo: true
                }
            });

            if (streamingsValidos !== data.streamingIds.length) {
                throw new Error("Um ou mais streamings selecionados são inválidos");
            }

            // Criar o grupo
            const novoGrupo = await tx.grupo.create({
                data: {
                    contaId,
                    nome: data.nome.trim(),
                    descricao: data.descricao?.trim() || null,
                    linkConvite,
                    isAtivo: true,
                }
            });

            // Vincular streamings
            await tx.grupoStreaming.createMany({
                data: data.streamingIds.map(streamingId => ({
                    grupoId: novoGrupo.id,
                    streamingId,
                    isAtivo: true
                }))
            });

            // Create notification inside transaction (Broadcast to Admins)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "grupo_criado",
                    titulo: `Grupo criado`,
                    descricao: `O grupo "${novoGrupo.nome}" foi criado com ${data.streamingIds.length} streaming(s).`,
                    entidadeId: novoGrupo.id,
                    metadata: {
                        linkConvite: novoGrupo.linkConvite
                    },
                    lida: false
                }
            });

            return novoGrupo;
        });

        revalidatePath("/grupos");
        return { success: true, data: grupo };
    } catch (error: any) {
        console.error("[CREATE_GRUPO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar grupo" };
    }
}

/**
 * Atualiza um grupo existente
 */
export async function updateGrupo(
    id: number,
    data: {
        nome: string;
        descricao?: string;
        streamingIds: number[];
    }
) {
    try {
        const { contaId, userId } = await getContext();

        // 1. Validate Plan Limits
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        // Validações
        if (!data.nome || !data.nome.trim()) {
            return { success: false, error: "Nome é obrigatório" };
        }

        if (!data.streamingIds || data.streamingIds.length === 0) {
            return { success: false, error: "Selecione pelo menos um streaming" };
        }

        const updated = await prisma.$transaction(async (tx) => {
            // Verificar se o grupo pertence à conta
            const grupoExistente = await tx.grupo.findFirst({
                where: { id, contaId, isAtivo: true }
            });

            if (!grupoExistente) {
                throw new Error("Grupo não encontrado");
            }

            // Verificar se os streamings pertencem à conta
            const streamingsValidos = await tx.streaming.count({
                where: {
                    id: { in: data.streamingIds },
                    contaId,
                    isAtivo: true
                }
            });

            if (streamingsValidos !== data.streamingIds.length) {
                throw new Error("Um ou mais streamings selecionados são inválidos");
            }

            // Atualizar dados do grupo
            const res = await tx.grupo.update({
                where: { id },
                data: {
                    nome: data.nome.trim(),
                    descricao: data.descricao?.trim() || null,
                }
            });

            // Remover vínculos antigos
            await tx.grupoStreaming.deleteMany({
                where: { grupoId: id }
            });

            // Criar novos vínculos
            await tx.grupoStreaming.createMany({
                data: data.streamingIds.map(streamingId => ({
                    grupoId: id,
                    streamingId,
                    isAtivo: true
                }))
            });

            // Create notification inside transaction (Broadcast to Admins)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "grupo_editado",
                    titulo: `Grupo atualizado`,
                    descricao: `O grupo "${data.nome}" foi atualizado.`,
                    entidadeId: id,
                    lida: false
                }
            });

            return res;
        });

        revalidatePath("/grupos");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("[UPDATE_GRUPO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar grupo" };
    }
}

/**
 * Soft delete de um grupo
 */
export async function deleteGrupo(id: number) {
    try {
        const { contaId, userId } = await getContext();

        await prisma.$transaction(async (tx) => {
            // Get grupo name before deleting
            const grupo = await tx.grupo.findFirst({
                where: { id, contaId },
                select: { nome: true }
            });

            if (!grupo) {
                throw new Error("Grupo não encontrado");
            }

            // Soft delete
            await tx.grupo.updateMany({
                where: { id, contaId },
                data: { isAtivo: false }
            });

            // Create notification inside transaction (Broadcast to Admins)
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null,
                    tipo: "grupo_excluido",
                    titulo: `Grupo removido`,
                    descricao: `O grupo "${grupo.nome}" foi removido.`,
                    entidadeId: id,
                    lida: false
                }
            });
        });

        revalidatePath("/grupos");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_GRUPO_ERROR]", error);
        return { success: false, error: error.message || "Erro ao deletar grupo" };
    }
}

// ============================================
// WHATSAPP MESSAGE GENERATION
// ============================================

/**
 * Gera mensagem de renovação formatada para WhatsApp
 * 
 * @param grupoId - ID do grupo
 * @param mesReferencia - Data de referência (usada para exibir o nome do mês)
 * @returns Texto formatado para envio via WhatsApp
 */
export async function gerarMensagemRenovacao(
    grupoId: number,
    mesReferencia: Date = new Date()
): Promise<any> {
    try {
        const { contaId } = await getContext();

        // Calculate start and end of the reference month
        const start = startOfMonth(mesReferencia);
        const end = endOfMonth(mesReferencia);

        const grupo = await prisma.grupo.findFirst({
            where: { id: grupoId, contaId, isAtivo: true },
            include: {
                streamings: {
                    where: { isAtivo: true },
                    include: {
                        streaming: {
                            include: {
                                catalogo: true,
                                assinaturas: {
                                    where: {
                                        status: { in: ["ativa", "suspensa"] },
                                        dataInicio: { lte: end }
                                    },
                                    include: {
                                        participante: true,
                                        // Filter charges that overlap with the reference month
                                        cobrancas: {
                                            where: {
                                                periodoInicio: { lte: end },
                                                periodoFim: { gte: start }
                                            },
                                            orderBy: { periodoFim: "desc" },
                                            take: 1
                                        }
                                    },
                                    orderBy: { createdAt: "asc" }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!grupo) {
            return { success: false, error: "Grupo não encontrado" };
        }

        // Format name of month and year
        const nomeMes = format(mesReferencia, "MMMM", { locale: ptBR }).toUpperCase();
        const ano = format(mesReferencia, "yyyy");

        // Fetch account details (currency and PIX key)
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: {
                moedaPreferencia: true,
                chavePix: true
            }
        });

        const { formatCurrency } = await import("@/lib/formatCurrency");
        const currency = (conta?.moedaPreferencia as CurrencyCode) || 'BRL';

        let mensagem = ` *RENOVAÇÃO - ${nomeMes}/${ano}* \n\n`;

        for (const gs of grupo.streamings) {
            const streaming = gs.streaming;
            const catalogo = streaming.catalogo;

            // Filter out cancelled subscriptions explicitly just in case
            const assinaturas = streaming.assinaturas.filter(a => a.status !== "cancelada");

            if (assinaturas.length === 0) continue;

            // Calcular valor por pessoa (valor integral / limite de participantes)
            const valorIntegral = streaming.valorIntegral.toNumber();
            const limiteParticipantes = streaming.limiteParticipantes || 1; // Prevent division by zero
            const valorPorPessoa = valorIntegral / limiteParticipantes;

            // Header: Only individual value - Use apelido (or catalogo.nome as fallback)
            const streamingNome = streaming.apelido || catalogo.nome;
            mensagem += `\n 🎬 *${streamingNome}* • ${formatCurrency(valorPorPessoa, currency)} p/ cada\n\n`;

            // Listar participantes com status
            assinaturas.forEach((assinatura, index) => {
                const participante = assinatura.participante;
                const cobrancaReferencia = assinatura.cobrancas[0];

                // Determinar emoji de status - APENAS PAGO TEM ÍCONE
                let statusEmoji = "";

                // Check if we found a charge for this period and if it is paid
                if (cobrancaReferencia?.status === "pago") {
                    statusEmoji = "✅";
                }

                // Montar linha do participante
                let linha = `${index + 1}- ${participante.nome}`;

                // Adicionar emoji se existir (com espaço antes)
                if (statusEmoji) {
                    linha += ` ${statusEmoji}`;
                }

                // Adicionar indicação de período pré-pago para assinaturas não-mensais pagas
                if (
                    assinatura.frequencia !== "mensal" &&
                    cobrancaReferencia?.status === "pago"
                ) {
                    const periodoFim = new Date(cobrancaReferencia.periodoFim);
                    const mesAno = format(periodoFim, "MMM/yy", { locale: ptBR });
                    linha += ` (pago até ${mesAno})`;
                }

                mensagem += `${linha}\n`;
            });
        }

        if (conta?.chavePix) {
            mensagem += `\nPIX: *${conta.chavePix}*`;
        }

        return { success: true, data: mensagem.trim() };
    } catch (error: any) {
        console.error("[GERAR_MENSAGEM_RENOVACAO_ERROR]", error);
        return { success: false, error: "Erro ao gerar mensagem de renovação" };
    }
}

/**
 * Retorna streamings disponíveis para vincular a um grupo
 */
export async function getStreamingsParaGrupo() {
    try {
        const { contaId } = await getContext();

        const streamings = await prisma.streaming.findMany({
            where: { contaId, isAtivo: true },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ["ativa", "suspensa"] } }
                        }
                    }
                }
            },
            orderBy: [
                { apelido: "asc" },
                { catalogo: { nome: "asc" } }
            ]
        });

        const data = streamings.map(s => ({
            ...s,
            valorIntegral: s.valorIntegral.toNumber()
        }));

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_STREAMINGS_PARA_GRUPO_ERROR]", error);
        return { success: false, error: "Erro ao buscar streamings para o grupo" };
    }
}
