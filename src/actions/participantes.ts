"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateCPF, validatePhone, validateEmail } from "@/lib/validation";

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

export async function getParticipantes() {
    const { contaId } = await getContext();

    return prisma.participante.findMany({
        where: { contaId },
        include: {
            _count: {
                select: {
                    assinaturas: {
                        where: {
                            status: {
                                in: ["ativa", "suspensa"]
                            }
                        }
                    }
                },
            },
        },
        orderBy: { nome: "asc" },
    });
}

export async function createParticipante(data: {
    nome: string;
    whatsappNumero: string;
    cpf?: string;
    email?: string;
}) {
    const { contaId } = await getContext();

    // Server-side validation
    if (!data.nome || !data.nome.trim()) {
        throw new Error("Nome é obrigatório");
    }

    if (data.cpf && data.cpf.trim() !== "" && !validateCPF(data.cpf)) {
        throw new Error("CPF inválido");
    }

    if (!data.whatsappNumero || !validatePhone(data.whatsappNumero)) {
        throw new Error("Telefone inválido");
    }

    if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
        throw new Error("Email inválido");
    }

    const participante = await prisma.participante.create({
        data: {
            ...data,
            cpf: data.cpf || null,
            contaId,
        },
    });

    revalidatePath("/participantes");
    return participante;
}

export async function updateParticipante(
    id: number,
    data: {
        nome: string;
        whatsappNumero: string;
        cpf?: string;
        email?: string;
    }
) {
    const { contaId } = await getContext();

    // Server-side validation
    if (!data.nome || !data.nome.trim()) {
        throw new Error("Nome é obrigatório");
    }

    if (data.cpf && data.cpf.trim() !== "" && !validateCPF(data.cpf)) {
        throw new Error("CPF inválido");
    }

    if (!data.whatsappNumero || !validatePhone(data.whatsappNumero)) {
        throw new Error("Telefone inválido");
    }

    if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
        throw new Error("Email inválido");
    }

    const participante = await prisma.participante.update({
        where: { id, contaId },
        data: {
            ...data,
            cpf: data.cpf || null,
        },
    });

    revalidatePath("/participantes");
    return participante;
}

export async function deleteParticipante(id: number) {
    const { contaId } = await getContext();

    // Use transaction to validate and delete atomically
    await prisma.$transaction(async (tx) => {
        // Check for active/suspended subscriptions
        const activeSubscriptions = await tx.assinatura.count({
            where: {
                participanteId: id,
                status: { in: ["ativa", "suspensa"] }
            }
        });

        if (activeSubscriptions > 0) {
            throw new Error(
                `Não é possível deletar este participante. ` +
                `Existem ${activeSubscriptions} assinatura(s) ativa(s). ` +
                `Cancele todas as assinaturas antes de prosseguir.`
            );
        }

        // Delete the participant
        await tx.participante.delete({
            where: { id, contaId },
        });
    });

    revalidatePath("/participantes");
}
