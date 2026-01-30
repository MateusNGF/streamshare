"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PLANS } from "@/config/plans";

// ============================================
// CONTEXT HELPER
// ============================================

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");

    return { userId: session.userId, contaId: userAccount.contaId };
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Lista todos os grupos da conta com contagem de streamings
 */
export async function getGrupos() {
    const { contaId } = await getContext();

    return prisma.grupo.findMany({
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
}

/**
 * Busca um grupo específico com todos os seus streamings e assinaturas
 */
export async function getGrupoById(id: number) {
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

    return grupo;
}

/**
 * Cria um novo grupo vinculando os streamings selecionados
 */
export async function createGrupo(data: {
    nome: string;
    descricao?: string;
    streamingIds: number[];
}) {


    // ... inside createGrupo ...

    const { contaId } = await getContext();

    // 1. Validate Plan Limits
    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { plano: true }
    });

    if (!conta) throw new Error("Conta não encontrada");

    const planConfig = PLANS[conta.plano];

    const currentGruposCount = await prisma.grupo.count({
        where: { contaId, isAtivo: true }
    });

    if (currentGruposCount >= planConfig.maxGrupos) {
        throw new Error(
            `Seu plano (${planConfig.label}) permite apenas ${planConfig.maxGrupos} grupo(s). ` +
            `Atualize para o plano PRO para ter acesso ilimitado.`
        );
    }

    // Validações
    if (!data.nome || !data.nome.trim()) {
        throw new Error("Nome é obrigatório");
    }

    if (!data.streamingIds || data.streamingIds.length === 0) {
        throw new Error("Selecione pelo menos um streaming");
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

        return novoGrupo;
    });

    revalidatePath("/grupos");
    return grupo;
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
    const { contaId } = await getContext();

    // 1. Validate Plan Limits
    const conta = await prisma.conta.findUnique({
        where: { id: contaId },
        select: { plano: true }
    });

    if (!conta) throw new Error("Conta não encontrada");

    const planConfig = PLANS[conta.plano];

    const currentGruposCount = await prisma.grupo.count({
        where: { contaId, isAtivo: true }
    });

    if (currentGruposCount >= planConfig.maxGrupos) {
        throw new Error(
            `Seu plano (${planConfig.label}) permite apenas ${planConfig.maxGrupos} grupo(s). ` +
            `Atualize para o plano PRO para ter acesso ilimitado.`
        );
    }

    // Validações
    if (!data.nome || !data.nome.trim()) {
        throw new Error("Nome é obrigatório");
    }

    if (!data.streamingIds || data.streamingIds.length === 0) {
        throw new Error("Selecione pelo menos um streaming");
    }

    await prisma.$transaction(async (tx) => {
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
        await tx.grupo.update({
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
    });

    revalidatePath("/grupos");
}

/**
 * Soft delete de um grupo
 */
export async function deleteGrupo(id: number) {
    const { contaId } = await getContext();

    await prisma.grupo.updateMany({
        where: { id, contaId },
        data: { isAtivo: false }
    });

    revalidatePath("/grupos");
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
): Promise<string> {
    const grupo = await getGrupoById(grupoId);

    if (!grupo) {
        throw new Error("Grupo não encontrado");
    }

    // Formatar nome do mês
    const nomeMes = format(mesReferencia, "MMMM", { locale: ptBR }).toUpperCase();

    let mensagem = `RENOVAÇÃO - ${nomeMes}\n`;

    for (const gs of grupo.streamings) {
        const streaming = gs.streaming;
        const catalogo = streaming.catalogo;

        // Filter out cancelled subscriptions explicitly just in case
        const assinaturas = streaming.assinaturas.filter(a => a.status !== "cancelada");

        if (assinaturas.length === 0) continue;

        // Calcular valor por pessoa (valor integral / limite de participantes)
        const valorIntegral = Number(streaming.valorIntegral);
        const limiteParticipantes = streaming.limiteParticipantes || 1; // Prevent division by zero
        const valorPorPessoa = valorIntegral / limiteParticipantes;

        // Header: Only individual value - Use apelido (or catalogo.nome as fallback)
        const streamingNome = streaming.apelido || catalogo.nome;
        mensagem += `\n🎬 *${streamingNome}* • R$ ${valorPorPessoa.toFixed(2).replace('.', ',')} p/ cada\n\n`;

        // Listar participantes com status
        assinaturas.forEach((assinatura, index) => {
            const participante = assinatura.participante;
            const ultimaCobranca = assinatura.cobrancas[0];

            // Determinar emoji de status - APENAS PAGO TEM ÍCONE
            let statusEmoji = "";
            if (ultimaCobranca?.status === "pago") {
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
                ultimaCobranca?.status === "pago"
            ) {
                const periodoFim = new Date(ultimaCobranca.periodoFim);
                const mesAno = format(periodoFim, "MMM/yy", { locale: ptBR });
                linha += ` (pago até ${mesAno})`;
            }

            mensagem += `${linha}\n`;
        });
    }

    return mensagem.trim();
}

/**
 * Retorna streamings disponíveis para vincular a um grupo
 */
export async function getStreamingsParaGrupo() {
    const { contaId } = await getContext();

    return prisma.streaming.findMany({
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
}
