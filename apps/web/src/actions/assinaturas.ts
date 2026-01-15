"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { FrequenciaPagamento, StatusAssinatura } from "@prisma/client";
import { criarCobrancaInicial } from "./cobrancas";

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

export async function getAssinaturas() {
    const { contaId } = await getContext();

    return prisma.assinatura.findMany({
        where: {
            participante: { contaId },
        },
        include: {
            participante: true,
            streaming: {
                include: {
                    catalogo: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createAssinatura(data: {
    participanteId: number;
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: number;
    dataInicio: string; // ISO Date string
}) {
    await getContext(); // Validate auth

    // Validations
    const existing = await prisma.assinatura.findFirst({
        where: {
            participanteId: data.participanteId,
            streamingId: data.streamingId,
            NOT: {
                status: StatusAssinatura.cancelada
            }
        }
    });

    if (existing) {
        throw new Error("Participante já possui uma assinatura ativa ou suspensa para este streaming.");
    }

    const dataInicio = new Date(data.dataInicio);

    const assinatura = await prisma.assinatura.create({
        data: {
            participanteId: data.participanteId,
            streamingId: data.streamingId,
            frequencia: data.frequencia,
            valor: data.valor,
            dataInicio: dataInicio,
            status: StatusAssinatura.ativa,
            diasAtraso: 0,
        },
    });

    // Auto-generate first charge
    await criarCobrancaInicial(assinatura.id);

    revalidatePath("/assinaturas");
    revalidatePath("/participantes");
    revalidatePath("/streamings");
    revalidatePath("/cobrancas");

    return assinatura;
}
