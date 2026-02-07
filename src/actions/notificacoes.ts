"use server";

import { prisma } from "@/lib/db";
import { TipoNotificacao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

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

/**
 * Get notifications for the current account
 */
export async function getNotificacoes(params?: {
    limite?: number;
    offset?: number;
    apenasNaoLidas?: boolean;
}) {
    const { contaId } = await getContext();
    const { limite = 20, offset = 0, apenasNaoLidas = false } = params || {};

    const where = {
        contaId,
        ...(apenasNaoLidas ? { lida: false } : {})
    };

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
    metadata?: Record<string, any>;
}) {
    const { contaId, userId } = await getContext();

    const notificacao = await prisma.notificacao.create({
        data: {
            contaId,
            usuarioId: userId,
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
