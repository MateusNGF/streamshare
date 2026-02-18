"use server";

import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";
import { StreamingSchema } from "@/lib/schemas";
import { PLANS } from "@/config/plans";
import { criarNotificacao } from "@/actions/notificacoes";
import { getContext } from "@/lib/action-context";
import { billingService } from "@/services/billing-service";
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";
import { StreamingService } from "@/services/streaming.service";
import { encrypt, safeDecrypt } from "@/lib/encryption";

export async function getCatalogos() {
    try {
        const data = await prisma.streamingCatalogo.findMany({
            where: { isAtivo: true },
            orderBy: { nome: "asc" },
        });
        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_CATALOGOS_ERROR]", error);
        return { success: false, error: "Erro ao buscar catálogos" };
    }
}

export async function createCatalogoItem(data: {
    nome: string;
    iconeUrl?: string;
    corPrimaria?: string;
}) {
    try {
        const { nivelAcesso } = await getContext();
        if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
            return { success: false, error: "Acesso negado", code: "FORBIDDEN" };
        }

        const item = await prisma.streamingCatalogo.create({
            data: {
                nome: data.nome,
                iconeUrl: data.iconeUrl,
                corPrimaria: data.corPrimaria || "#000000",
                isAtivo: true,
            },
        });

        revalidatePath("/admin/catalogo");
        revalidatePath("/streamings");
        return { success: true, data: item };
    } catch (error: any) {
        console.error("[CREATE_CATALOGO_ITEM_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar item do catálogo" };
    }
}

export async function updateCatalogoItem(
    id: number,
    data: {
        nome?: string;
        iconeUrl?: string;
        corPrimaria?: string;
        isAtivo?: boolean;
    }
) {
    try {
        const { nivelAcesso } = await getContext();
        if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
            return { success: false, error: "Acesso negado", code: "FORBIDDEN" };
        }

        const item = await prisma.streamingCatalogo.update({
            where: { id },
            data: {
                ...data,
            },
        });

        revalidatePath("/admin/catalogo");
        revalidatePath("/streamings");
        return { success: true, data: item };
    } catch (error: any) {
        console.error("[UPDATE_CATALOGO_ITEM_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar item do catálogo" };
    }
}

export async function deleteCatalogoItem(id: number) {
    try {
        const { nivelAcesso } = await getContext();
        if (nivelAcesso !== "admin" && nivelAcesso !== "owner") {
            return { success: false, error: "Acesso negado", code: "FORBIDDEN" };
        }

        // Soft delete
        await prisma.streamingCatalogo.update({
            where: { id },
            data: { isAtivo: false },
        });

        revalidatePath("/admin/catalogo");
        revalidatePath("/streamings");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_CATALOGO_ITEM_ERROR]", error);
        return { success: false, error: error.message || "Erro ao deletar item do catálogo" };
    }
}

export async function getStreamings() {
    try {
        const { contaId } = await getContext();

        const streamings = await prisma.streaming.findMany({
            where: { contaId },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { in: ["ativa", "suspensa", "pendente"] }
                            }
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
            valorIntegral: s.valorIntegral.toNumber(),
            vagasRestantes: s.limiteParticipantes - s._count.assinaturas
        }));

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_STREAMINGS_ERROR]", error);
        return { success: false, error: "Erro ao buscar streamings" };
    }
}

export async function getNextStreamingNumber(catalogoId: number) {
    try {
        const { contaId } = await getContext();

        const count = await prisma.streaming.count({
            where: {
                streamingCatalogoId: catalogoId,
                contaId
            }
        });

        return { success: true, data: count + 1 };
    } catch (error: any) {
        console.error("[GET_NEXT_STREAMING_NUMBER_ERROR]", error);
        return { success: false, error: "Erro ao gerar número do streaming", data: 1 };
    }
}

/**
 * Get the count of active subscriptions for a streaming
 */
export async function getActiveSubscriptionsCount(streamingId: number) {
    try {
        const { contaId } = await getContext();

        const count = await prisma.assinatura.count({
            where: {
                streamingId,
                streaming: { contaId },
                status: { in: ["ativa", "suspensa"] }
            }
        });

        return { success: true, data: count };
    } catch (error: any) {
        console.error("[GET_ACTIVE_SUBSCRIPTIONS_COUNT_ERROR]", error);
        return { success: false, error: "Erro ao buscar contagem de assinaturas" };
    }
}
/**
 * Update the value of all existing active subscriptions for a streaming
 */
export async function updateExistingSubscriptionValues(streamingId: number, newValue: number) {
    try {
        const { contaId } = await getContext();

        const result = await prisma.$transaction(async (tx) => {
            const updatedAssinaturas = await tx.assinatura.updateMany({
                where: {
                    streamingId,
                    streaming: { contaId },
                    status: { in: ["ativa", "suspensa", "pendente"] }
                },
                data: {
                    valor: newValue
                }
            });

            // Also update pending charges for these subscriptions correctly handling frequency
            const updatedCobrancasCount = await billingService.ajustarPrecosPendentes(tx, {
                streamingId,
                novoValorMensal: newValue,
                contaId
            });

            return { assinaturasCount: updatedAssinaturas.count, cobrancasCount: updatedCobrancasCount };
        });

        revalidatePath("/assinaturas");
        revalidatePath("/cobrancas");
        return { success: true, data: result.assinaturasCount };
    } catch (error: any) {
        console.error("[UPDATE_EXISTING_SUBSCRIPTION_VALUES_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar valores das assinaturas" };
    }
}

/**
 * Busca streamings públicos para o Explorer
 */
export async function getPublicStreamings(filters?: {
    search?: string;
    catalogoId?: number;
    onlyMyAccount?: boolean;
}) {
    try {
        const { contaId, userId } = await getContext();

        const where: any = {
            isAtivo: true,
            isPublico: true,
            deletedAt: null
        };

        if (filters?.catalogoId) {
            where.streamingCatalogoId = filters.catalogoId;
        }

        if (filters?.search) {
            const searchTerm = filters.search.slice(0, 100); // Limit search term length for performance
            where.OR = [
                { apelido: { contains: searchTerm, mode: 'insensitive' } },
                { catalogo: { nome: { contains: searchTerm, mode: 'insensitive' } } }
            ];
        }

        // Filter logic: Default hides own streamings, toggle shows ONLY own streamings
        if (filters?.onlyMyAccount) {
            where.contaId = contaId;
        } else {
            where.contaId = { not: contaId };
        }

        const streamings = await prisma.streaming.findMany({
            where,
            include: {
                catalogo: true,
                conta: {
                    select: { nome: true, id: true }
                },
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ['ativa', 'suspensa'] } }
                        }
                    }
                },
                // Check for existing requests/invites for the current user
                convites: {
                    where: {
                        usuarioId: userId
                    },
                    select: {
                        status: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                // Check for existing active subscription
                assinaturas: {
                    where: {
                        participante: {
                            userId: userId
                        },
                        status: { in: ['ativa', 'suspensa'] }
                    },
                    select: {
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const data = streamings.map(s => {
            const userStatus = determineUserStreamingStatus(s.assinaturas, s.convites);

            return {
                ...s,
                valorIntegral: s.valorIntegral.toNumber(),
                vagasDisponiveis: s.limiteParticipantes - s._count.assinaturas,
                isOwner: s.conta.id === contaId,
                userStatus
            };
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PUBLIC_STREAMINGS_ERROR]", error);
        return { success: false, error: "Erro ao buscar streamings públicos" };
    }
}

/**
 * Helper to determine the user's relationship status with a streaming service.
 * Prioritizes active participation, then pending requests/invites.
 */
function determineUserStreamingStatus(
    assinaturas: { status: string }[],
    convites: { status: string }[]
): 'participando' | 'solicitado' | 'convidado' | 'recusado' | null {
    if (assinaturas.length > 0) {
        return 'participando';
    }

    if (convites.length > 0) {
        // Prioritize the top-most relevant status (since we order by createdAt desc)
        const convite = convites[0];
        if (convite.status === 'solicitado') return 'solicitado';
        if (convite.status === 'pendente') return 'convidado';
        if (convite.status === 'recusado') return 'recusado';
    }

    return null;
}

export async function createStreaming(data: {
    catalogoId: number;
    apelido: string;
    valorIntegral: number;
    limiteParticipantes: number;
    isPublico?: boolean;
}) {
    try {
        const { contaId } = await getContext();

        // 1. Fetch Account and Plan
        const conta = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { plano: true }
        });

        if (!conta) return { success: false, error: "Conta não encontrada" };

        // 1. Validate Feature Access & Limits
        const accountData = await prisma.conta.findUnique({
            where: { id: contaId },
            select: { _count: { select: { streamings: true } } }
        });

        const totalStreamings = accountData?._count.streamings || 0;

        const check = await FeatureGuards.checkLimit(conta.plano as PlanoConta, "max_streamings", totalStreamings);
        if (!check.enabled) {
            return { success: false, error: check.reason };
        }

        // Business validations using Zod
        const validatedData = StreamingSchema.parse({
            ...data,
            catalogoId: String(data.catalogoId)
        });

        // Validate catalog exists and is active
        const catalogo = await prisma.streamingCatalogo.findUnique({
            where: { id: data.catalogoId }
        });

        if (!catalogo) {
            return { success: false, error: "Catálogo de streaming não encontrado" };
        }

        if (!catalogo.isAtivo) {
            return { success: false, error: "Este catálogo de streaming não está mais disponível" };
        }

        const streaming = await prisma.streaming.create({
            data: {
                contaId,
                streamingCatalogoId: data.catalogoId,
                apelido: data.apelido.trim(),
                valorIntegral: data.valorIntegral,
                limiteParticipantes: data.limiteParticipantes,
                isPublico: data.isPublico || false,
            },
            include: {
                catalogo: true,
                _count: {
                    select: {
                        assinaturas: {
                            where: {
                                status: { in: ["ativa", "suspensa", "pendente"] }
                            }
                        }
                    }
                }
            }
        });

        // Create notification (Broadcast to Admins)
        await criarNotificacao({
            tipo: "streaming_criado",
            titulo: `Streaming adicionado`,
            descricao: `${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''} foi adicionado ao sistema.`,
            entidadeId: streaming.id,
            usuarioId: null // Admin Broadcast
        });

        revalidatePath("/streamings");
        return {
            success: true,
            data: {
                ...streaming,
                valorIntegral: streaming.valorIntegral.toNumber()
            }
        };
    } catch (error: any) {
        console.error("[CREATE_STREAMING_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar streaming" };
    }
}

export async function updateStreaming(
    id: number,
    data: {
        catalogoId: number;
        apelido: string;
        valorIntegral: number;
        limiteParticipantes: number;
        isPublico?: boolean;
        updateExistingSubscriptions?: boolean;
    }
) {
    try {
        const { contaId } = await getContext();

        const validatedData = StreamingSchema.parse({
            ...data,
            catalogoId: String(data.catalogoId)
        });

        const currentStreaming = await prisma.streaming.findUnique({
            where: { id, contaId },
            include: {
                _count: {
                    select: {
                        assinaturas: {
                            where: { status: { in: ["ativa", "suspensa", "pendente"] } }
                        }
                    }
                }
            }
        });

        if (!currentStreaming) {
            return { success: false, error: "Streaming não encontrado" };
        }

        const activeSubscriptionsCount = currentStreaming._count.assinaturas;

        const valueChanged = currentStreaming.valorIntegral.toString() !== data.valorIntegral.toString();
        const shouldUpdateSubscriptions = valueChanged && data.updateExistingSubscriptions && activeSubscriptionsCount > 0;

        if (!shouldUpdateSubscriptions) {
            const streaming = await prisma.streaming.update({
                where: { id, contaId },
                data: {
                    streamingCatalogoId: data.catalogoId,
                    apelido: data.apelido.trim(),
                    valorIntegral: data.valorIntegral,
                    limiteParticipantes: data.limiteParticipantes,
                    isPublico: data.isPublico,
                },
                include: {
                    catalogo: true,
                    _count: {
                        select: {
                            assinaturas: {
                                where: { status: { in: ["ativa", "suspensa", "pendente"] } }
                            }
                        }
                    }
                }
            });

            await criarNotificacao({
                tipo: "streaming_editado",
                titulo: `Streaming atualizado`,
                descricao: `As informações de ${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''} foram atualizadas.`,
                entidadeId: streaming.id
            });

            revalidatePath("/streamings");
            revalidatePath("/assinaturas");
            return {
                success: true,
                data: {
                    streaming: {
                        ...streaming,
                        valorIntegral: streaming.valorIntegral.toNumber()
                    },
                    updatedSubscriptions: 0
                }
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            const streaming = await tx.streaming.update({
                where: { id, contaId },
                data: {
                    streamingCatalogoId: data.catalogoId,
                    apelido: data.apelido.trim(),
                    valorIntegral: data.valorIntegral,
                    limiteParticipantes: data.limiteParticipantes,
                    isPublico: data.isPublico,
                },
                include: {
                    catalogo: true,
                    _count: {
                        select: {
                            assinaturas: {
                                where: { status: { in: ["ativa", "suspensa", "pendente"] } }
                            }
                        }
                    }
                }
            });

            const updated = await tx.assinatura.updateMany({
                where: {
                    streamingId: id,
                    streaming: { contaId },
                    status: { in: ["ativa", "suspensa", "pendente"] }
                },
                data: {
                    valor: data.valorIntegral
                }
            });

            // Update pending charges as well correctly handling frequency
            const updatedCobrancasCount = await billingService.ajustarPrecosPendentes(tx, {
                streamingId: id,
                novoValorMensal: data.valorIntegral,
                contaId
            });

            return { streaming, updatedCount: updated.count };
        });

        // Broadcast to Admins
        await criarNotificacao({
            tipo: "streaming_editado",
            titulo: `Streaming atualizado`,
            descricao: `As informações do streaming foram atualizadas${result.updatedCount > 0 ? ` e ${result.updatedCount} assinatura(s) ajustada(s)` : ''}.`,
            entidadeId: id,
            usuarioId: null // Admin Broadcast
        });

        revalidatePath("/streamings");
        revalidatePath("/assinaturas");
        return {
            success: true,
            data: {
                streaming: {
                    ...result.streaming,
                    valorIntegral: result.streaming.valorIntegral.toNumber()
                },
                updatedSubscriptions: result.updatedCount
            }
        };
    } catch (error: any) {
        console.error("[UPDATE_STREAMING_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar streaming" };
    }
}

export async function deleteStreaming(id: number) {
    try {
        const { contaId } = await getContext();

        // Use transaction to validate and delete atomically
        await prisma.$transaction(async (tx) => {
            // Check for active/suspended subscriptions
            const activeSubscriptions = await tx.assinatura.count({
                where: {
                    streamingId: id,
                    status: { in: ["ativa", "suspensa"] }
                }
            });

            if (activeSubscriptions > 0) {
                throw new Error(
                    `Não é possível deletar este streaming. ` +
                    `Existem ${activeSubscriptions} assinatura(s) ativa(s). ` +
                    `Cancele todas as assinaturas antes de prosseguir.`
                );
            }

            // Get streaming name before deleting
            const streaming = await tx.streaming.findUnique({
                where: { id, contaId },
                include: { catalogo: true }
            });

            if (!streaming) {
                throw new Error("Streaming não encontrado");
            }

            // Soft delete the streaming
            await tx.streaming.update({
                where: { id, contaId },
                data: {
                    isAtivo: false,
                    deletedAt: new Date()
                }
            });

            return `${streaming.catalogo.nome}${streaming.apelido ? ` (${streaming.apelido})` : ''}`;
        });

        // Create notification
        const streamingName = await prisma.$transaction(async (tx) => {
            const s = await tx.streaming.findUnique({
                where: { id },
                include: { catalogo: true }
            });
            return s ? `${s.catalogo.nome}${s.apelido ? ` (${s.apelido})` : ''}` : null;
        }).catch(() => null);

        // Create notification (Broadcast to Admins)
        await criarNotificacao({
            tipo: "streaming_excluido",
            titulo: `Streaming removido`,
            descricao: streamingName ? `${streamingName} foi removido do sistema.` : "Um streaming foi removido do sistema.",
            entidadeId: id,
            usuarioId: null // Admin Broadcast
        });

        revalidatePath("/streamings");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_STREAMING_ERROR]", error);
        return { success: false, error: error.message || "Erro ao deletar streaming" };
    }
}

export async function generateStreamingShareLink(streamingId: number, expiration: string) {
    try {
        const { contaId, userId } = await getContext();
        const data = await StreamingService.generateShareLink(streamingId, expiration, contaId, userId);
        return { success: true, data };
    } catch (error: any) {
        console.error("[GENERATE_SHARE_LINK_ERROR]", error);
        return { success: false, error: error.message || "Erro ao gerar link de compartilhamento" };
    }
}

export async function getStreamingLinksHistory(streamingId: number) {
    try {
        const { contaId } = await getContext();
        const data = await prisma.convite.findMany({
            where: {
                streamingId,
                contaId,
                email: "public-link@system.internal"
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_STREAMING_LINKS_HISTORY_ERROR]", error);
        return { success: false, error: "Erro ao buscar histórico de links" };
    }
}

export async function revokeStreamingLink(inviteId: string) {
    try {
        const { contaId } = await getContext();
        await prisma.convite.update({
            where: { id: inviteId, contaId },
            data: { status: "recusado" }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("[REVOKE_STREAMING_LINK_ERROR]", error);
        return { success: false, error: "Erro ao revogar link" };
    }
}

export async function getStreamingByPublicToken(token: string) {
    try {
        const data = await StreamingService.validatePublicToken(token);
        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_STREAMING_BY_PUBLIC_TOKEN_ERROR]", error);
        return { success: false, error: "Token inválido ou expirado" };
    }
}

// ───────────────────────────────────────────────
// Credential CRUD (Admin)
// ───────────────────────────────────────────────

export async function getStreamingCredentials(streamingId: number) {
    try {
        const { contaId } = await getContext();

        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId, contaId },
            select: { id: true }
        });

        if (!streaming) {
            return { success: false, error: "Streaming não encontrado" };
        }

        const credenciais = await prisma.streamingCredenciais.findUnique({
            where: { streamingId }
        });

        return {
            success: true,
            data: credenciais ? {
                login: credenciais.login || null,
                senha: safeDecrypt(credenciais.senhaEncrypted) || null
            } : null
        };
    } catch (error: any) {
        console.error("[GET_STREAMING_CREDENTIALS_ERROR]", error);
        return { success: false, error: "Erro ao buscar credenciais" };
    }
}

export async function upsertStreamingCredentials(
    streamingId: number,
    data: { login?: string | null; senha?: string | null }
) {
    try {
        const { contaId } = await getContext();

        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId, contaId },
            select: { id: true }
        });

        if (!streaming) {
            return { success: false, error: "Streaming não encontrado" };
        }

        const senhaEncrypted = data.senha ? encrypt(data.senha) : null;

        await prisma.streamingCredenciais.upsert({
            where: { streamingId },
            create: {
                streamingId,
                login: data.login || null,
                senhaEncrypted,
            },
            update: {
                login: data.login || null,
                senhaEncrypted,
            }
        });

        revalidatePath("/streamings");
        return { success: true };
    } catch (error: any) {
        console.error("[UPSERT_STREAMING_CREDENTIALS_ERROR]", error);
        return { success: false, error: "Erro ao salvar credenciais" };
    }
}

export async function deleteStreamingCredentials(streamingId: number) {
    try {
        const { contaId } = await getContext();

        const streaming = await prisma.streaming.findUnique({
            where: { id: streamingId, contaId },
            select: { id: true }
        });

        if (!streaming) {
            return { success: false, error: "Streaming não encontrado" };
        }

        await prisma.streamingCredenciais.deleteMany({
            where: { streamingId }
        });

        revalidatePath("/streamings");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_STREAMING_CREDENTIALS_ERROR]", error);
        return { success: false, error: "Erro ao remover credenciais" };
    }
}
