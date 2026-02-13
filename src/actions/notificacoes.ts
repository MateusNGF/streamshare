"use server";

import { prisma } from "@/lib/db";
import { TipoNotificacao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getContext } from "@/lib/action-context";

/**
 * Get notifications for the current account
 */
export async function getNotificacoes(params?: {
    limite?: number;
    offset?: number;
    apenasNaoLidas?: boolean;
    tipos?: TipoNotificacao[];
    dataInicio?: Date;
}) {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const { contaId } = await getContext();
    const { limite = 20, offset = 0, apenasNaoLidas = false, tipos, dataInicio } = params || {};

    const where: any = {
        contaId,
        ...(apenasNaoLidas ? { lida: false } : {}),
        ...(dataInicio ? { createdAt: { gte: dataInicio } } : {}),
        OR: [
            { usuarioId: session.userId }, // Minhas notificações diretas
            { usuarioId: null }            // Alertas globais da conta (Admins)
        ]
    };

    if (tipos && tipos.length > 0) {
        where.tipo = { in: tipos };
    }

    const [notificacoes, total, naoLidas] = await Promise.all([
        prisma.notificacao.findMany({
            where,
            include: {
                usuario: {
                    select: { nome: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limite,
            skip: offset
        }),
        prisma.notificacao.count({ where }),
        prisma.notificacao.count({ where: { contaId, lida: false } })
    ]);

    return { notificacoes, total, naoLidas };
}

/**
 * Create a new notification
 */
export async function criarNotificacao(data: {
    tipo: TipoNotificacao;
    titulo: string;
    descricao?: string;
    entidadeId?: number;
    usuarioId?: number | null; // NULL = Admins, ID = Specific User
    metadata?: Record<string, any>;
}) {
    const { contaId, userId } = await getContext();

    const notificacao = await prisma.notificacao.create({
        data: {
            contaId,
            usuarioId: data.usuarioId !== undefined ? data.usuarioId : userId,
            tipo: data.tipo,
            titulo: data.titulo,
            descricao: data.descricao,
            entidadeId: data.entidadeId,
            metadata: data.metadata || {}
        }
    });

    revalidatePath("/", "layout");
    return notificacao;
}

/**
 * Mark notification as read
 */
export async function marcarComoLida(id: number) {
    const { contaId } = await getContext();

    await prisma.notificacao.updateMany({
        where: { id, contaId },
        data: { lida: true }
    });

    revalidatePath("/", "layout");
}

/**
 * Mark all notifications as read
 */
export async function marcarTodasComoLidas() {
    const { contaId } = await getContext();

    await prisma.notificacao.updateMany({
        where: { contaId, lida: false },
        data: { lida: true }
    });

    revalidatePath("/", "layout");
}

/**
 * Delete old notifications (30+ days)
 */
export async function limparNotificacoesAntigas() {
    const { contaId } = await getContext();
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const result = await prisma.notificacao.deleteMany({
        where: {
            contaId,
            createdAt: { lt: dataLimite }
        }
    });

    revalidatePath("/", "layout");
    return result;
}
