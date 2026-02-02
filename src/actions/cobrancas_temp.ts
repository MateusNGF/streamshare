"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatusCobranca } from "@prisma/client";
import {
    calcularProximoVencimento,
    calcularValorPeriodo,
    estaAtrasado
} from "@/lib/financeiro-utils";

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
 * Get all charges for the current account with optional filters
 */
export async function getCobrancas(filters?: {
    status?: StatusCobranca;
    participanteId?: number;
    mes?: number;
    ano?: number;
}) {
    const { contaId } = await getContext();

    const where: any = {
        assinatura: {
            participante: { contaId }
        }
    };

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.participanteId) {
        where.assinatura = {
            ...where.assinatura,
            participanteId: filters.participanteId
        };
    }

    if (filters?.mes && filters?.ano) {
        const startDate = new Date(filters.ano, filters.mes - 1, 1);
        const endDate = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
        where.periodoFim = { gte: startDate, lte: endDate };
    }

    const cobrancas = await prisma.cobranca.findMany({
        where,
        include: {
            assinatura: {
                include: {
                    participante: true,
                    streaming: {
                        include: { catalogo: true }
                    }
                }
            }
        },
        orderBy: { periodoFim: "desc" }
    });

    return cobrancas;
}

/**
 * Create initial charge when subscription is created
 */
export async function criarCobrancaInicial(assinaturaId: number) {
    await getContext(); // Validate auth

    const assinatura = await prisma.assinatura.findUnique({
        where: { id: assinaturaId }
    });

    if (!assinatura) {
        throw new Error("Assinatura não encontrada");
    }

    const periodoInicio = assinatura.dataInicio;
    const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
    const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

    const cobranca = await prisma.cobranca.create({
        data: {
            assinaturaId,
            valor,
            periodoInicio,
            periodoFim,
            status: StatusCobranca.pendente
        }
    });

    revalidatePath("/cobrancas");
    return cobranca;
}

/**
 * Confirm payment for a charge
 */
export async function confirmarPagamento(
    cobrancaId: number,
    comprovanteUrl?: string
) {
    const { contaId } = await getContext();

    // Verify ownership
    const cobranca = await prisma.cobranca.findFirst({
        where: {
            id: cobrancaId,
            assinatura: {
                participante: { contaId }
            }
        }
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.status === StatusCobranca.pago) {
        throw new Error("Cobrança já foi confirmada");
    }

    const updated = await prisma.cobranca.update({
        where: { id: cobrancaId },
        data: {
            status: StatusCobranca.pago,
            dataPagamento: new Date(),
            comprovanteUrl
        }
    });

    revalidatePath("/cobrancas");
    return updated;
}

/**
 * Get financial KPIs for dashboard
 */
export async function getKPIsFinanceiros() {
    const { contaId } = await getContext();

    const todasCobrancas = await prisma.cobranca.findMany({
        where: {
            assinatura: {
                participante: { contaId }
            }
        }
    });

    const totalPendente = todasCobrancas
        .filter(c => c.status === StatusCobranca.pendente)
        .reduce((sum, c) => sum + Number(c.valor), 0);

    const receitaConfirmada = todasCobrancas
        .filter(c => c.status === StatusCobranca.pago)
        .reduce((sum, c) => sum + Number(c.valor), 0);

    const emAtraso = todasCobrancas
        .filter(c => c.status === StatusCobranca.pendente && estaAtrasado(c.periodoFim))
        .reduce((sum, c) => sum + Number(c.valor), 0);

    return {
        totalPendente,
        receitaConfirmada,
        emAtraso,
        totalCobrancas: todasCobrancas.length
    };
}

/**
 * Renew charges for active subscriptions (CRON job or manual trigger)
 */
export async function renovarCobrancas() {
    const { contaId } = await getContext();

    // Find active subscriptions where the last charge is expiring soon
    const assinaturasAtivas = await prisma.assinatura.findMany({
        where: {
            status: "ativa",
            participante: { contaId }
        },
        include: {
            cobrancas: {
                orderBy: { periodoFim: "desc" },
                take: 1
            }
        }
    });

    let renovadas = 0;

    for (const assinatura of assinaturasAtivas) {
        const ultimaCobranca = assinatura.cobrancas[0];

        if (!ultimaCobranca) continue;

        // Generate new charge if last one expires in the next 5 days
        const diasParaVencimento = Math.ceil(
            (ultimaCobranca.periodoFim.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasParaVencimento <= 5 && diasParaVencimento >= 0) {
            const periodoInicio = ultimaCobranca.periodoFim;
            const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
            const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

            await prisma.cobranca.create({
                data: {
                    assinaturaId: assinatura.id,
                    valor,
                    periodoInicio,
                    periodoFim,
                    status: StatusCobranca.pendente
                }
            });

            renovadas++;
        }
    }

    revalidatePath("/cobrancas");

    return { renovadas };
}

