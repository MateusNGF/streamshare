"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateCPF, validatePhone, validateEmail } from "@/lib/validation";
import { criarNotificacao } from "@/actions/notificacoes";

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
    whatsappNumero?: string;
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

    if (data.whatsappNumero && data.whatsappNumero.trim() !== "" && !validatePhone(data.whatsappNumero)) {
        throw new Error("Telefone inválido");
    }

    if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
        throw new Error("Email inválido");
    }

    const participante = await prisma.participante.create({
        data: {
            ...data,
            cpf: data.cpf || null,
            whatsappNumero: data.whatsappNumero || null,
            contaId,
        },
    });

    // Create notification
    await criarNotificacao({
        tipo: "participante_criado",
        titulo: `Participante adicionado`,
        descricao: `${participante.nome} foi adicionado ao sistema.`,
        entidadeId: participante.id,
        metadata: {
            whatsapp: participante.whatsappNumero
        }
    });

    revalidatePath("/participantes");
    return participante;
}

export async function updateParticipante(
    id: number,
    data: {
        nome: string;
        whatsappNumero?: string;
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

    if (data.whatsappNumero && data.whatsappNumero.trim() !== "" && !validatePhone(data.whatsappNumero)) {
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
            whatsappNumero: data.whatsappNumero || null,
        },
    });

    // Create notification
    await criarNotificacao({
        tipo: "participante_editado",
        titulo: `Participante atualizado`,
        descricao: `As informações de ${participante.nome} foram atualizadas.`,
        entidadeId: participante.id
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

        // Get participant name before deleting
        const participante = await tx.participante.findUnique({
            where: { id, contaId },
            select: { nome: true }
        });

        if (!participante) {
            throw new Error("Participante não encontrado");
        }

        // Delete the participant
        await tx.participante.delete({
            where: { id, contaId },
        });

        // Create notification (outside transaction to avoid rollback issues)
        return participante.nome;
    });

    // Create notification
    const participanteName = await prisma.$transaction(async (tx) => {
        const p = await tx.participante.findUnique({
            where: { id },
            select: { nome: true }
        });
        return p?.nome;
    }).catch(() => null);

    await criarNotificacao({
        tipo: "participante_excluido",
        titulo: `Participante removido`,
        descricao: participanteName ? `${participanteName} foi removido do sistema.` : "Um participante foi removido do sistema.",
        entidadeId: id
    });

    revalidatePath("/participantes");
}
