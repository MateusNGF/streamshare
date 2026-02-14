"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StatusCobranca } from "@prisma/client";

export async function getFaturasUsuario(filters?: { status?: StatusCobranca }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Não autenticado");

    const cobrancas = await prisma.cobranca.findMany({
        where: {
            assinatura: {
                participante: {
                    userId: user.userId
                }
            },
            ...(filters?.status ? { status: filters.status } : {})
        },
        include: {
            assinatura: {
                include: {
                    streaming: {
                        include: { catalogo: true }
                    },
                    participante: {
                        include: {
                            conta: {
                                select: {
                                    id: true,
                                    nome: true,
                                    chavePix: true,
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: [
            { status: 'asc' }, // Status might need better sort (pendente -> atrasado -> pago -> cancelado)
            { dataVencimento: 'asc' }
        ]
    });

    return cobrancas;
}

export async function getResumoFaturas() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Não autenticado");

    const stats = await prisma.cobranca.groupBy({
        by: ["status"],
        where: {
            assinatura: {
                participante: {
                    userId: user.userId
                }
            }
        },
        _sum: {
            valor: true
        },
        _count: {
            _all: true
        }
    });

    const resumo = stats.reduce((acc, curr) => {
        acc[curr.status] = {
            total: curr._sum.valor?.toNumber() || 0,
            count: curr._count._all
        };
        return acc;
    }, {} as Record<StatusCobranca, { total: number; count: number }>);

    return resumo;
}
