"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StatusCobranca } from "@prisma/client";

export async function getFaturasUsuario(filters?: { status?: StatusCobranca }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

        const cobrancas = await prisma.cobranca.findMany({
            where: {
                assinatura: {
                    participante: {
                        userId: user.userId
                    }
                },
                ...(filters?.status ? { status: filters.status } : {})
            },
            select: {
                id: true,
                status: true,
                valor: true,
                dataVencimento: true,
                periodoInicio: true,
                periodoFim: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                dataPagamento: true,
                comprovanteUrl: true,
                dataEnvioComprovante: true,
                gatewayTransactionId: true,
                gatewayProvider: true,
                tentativas: true,
                metadataJson: true,
                lotePagamentoId: true,
                assinaturaId: true,
                assinatura: {
                    select: {
                        id: true,
                        status: true,
                        participanteId: true,
                        frequencia: true,
                        valor: true,
                        streaming: {
                            select: {
                                id: true,
                                apelido: true,
                                catalogo: {
                                    select: {
                                        nome: true,
                                        iconeUrl: true,
                                        corPrimaria: true
                                    }
                                }
                            }
                        },
                        participante: {
                            select: {
                                id: true,
                                nome: true,
                                whatsappNumero: true,
                                contaId: true,
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
                { status: 'asc' },
                { dataVencimento: 'asc' }
            ]
        });

        return { success: true, data: cobrancas };
    } catch (error: any) {
        console.error("[GET_FATURAS_USUARIO_ERROR]", error);
        return { success: false, error: "Erro ao buscar faturas do usuário" };
    }
}

export async function getResumoFaturas() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };

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

        return { success: true, data: resumo };
    } catch (error: any) {
        console.error("[GET_RESUMO_FATURAS_ERROR]", error);
        return { success: false, error: "Erro ao buscar resumo das faturas" };
    }
}
