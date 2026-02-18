"use server";

import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";
import { validateCPF, validatePhone, validateEmail } from "@/lib/validation";

import { getContext } from "@/lib/action-context";

export async function getParticipantes() {
    try {
        const { contaId } = await getContext();

        const data = await prisma.participante.findMany({
            where: { contaId, deletedAt: null },
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
                    }
                },
            },
            orderBy: { nome: "asc" },
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PARTICIPANTES_ERROR]", error);
        return { success: false, error: "Erro ao buscar participantes" };
    }
}

export async function createParticipante(data: {
    nome: string;
    whatsappNumero?: string;
    cpf?: string;
    email?: string;
}) {
    try {
        const { contaId, userId } = await getContext();

        // Server-side validation
        if (!data.nome || !data.nome.trim()) {
            return { success: false, error: "Nome é obrigatório" };
        }

        if (data.cpf && data.cpf.trim() !== "" && !validateCPF(data.cpf)) {
            return { success: false, error: "CPF inválido" };
        }

        if (data.whatsappNumero && data.whatsappNumero.trim() !== "" && !validatePhone(data.whatsappNumero)) {
            return { success: false, error: "Telefone inválido" };
        }

        if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
            return { success: false, error: "Email inválido" };
        }

        const result = await prisma.$transaction(async (tx) => {
            const created = await tx.participante.create({
                data: {
                    ...data,
                    cpf: data.cpf || null,
                    whatsappNumero: data.whatsappNumero || null,
                    contaId,
                },
            });

            // Create notification inside transaction
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null, // Broadcast para Admins
                    tipo: "participante_criado",
                    titulo: `Participante adicionado`,
                    descricao: `${created.nome} foi adicionado ao sistema por ${userId}.`,
                    entidadeId: created.id,
                    metadata: {
                        whatsapp: created.whatsappNumero
                    },
                    lida: false
                }
            });

            return created;
        });

        revalidatePath("/participantes");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[CREATE_PARTICIPANTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao criar participante" };
    }
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
    try {
        const { contaId, userId } = await getContext();

        // Server-side validation
        if (!data.nome || !data.nome.trim()) {
            return { success: false, error: "Nome é obrigatório" };
        }

        if (data.cpf && data.cpf.trim() !== "" && !validateCPF(data.cpf)) {
            return { success: false, error: "CPF inválido" };
        }

        if (data.whatsappNumero && data.whatsappNumero.trim() !== "" && !validatePhone(data.whatsappNumero)) {
            return { success: false, error: "Telefone inválido" };
        }

        if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
            return { success: false, error: "Email inválido" };
        }

        const result = await prisma.$transaction(async (tx) => {
            // Check if email matches an existing user to auto-link
            let userIdToLink = null;
            if (data.email) {
                const existingUser = await tx.usuario.findUnique({
                    where: { email: data.email }
                });
                if (existingUser) {
                    userIdToLink = existingUser.id;
                }
            }

            const updated = await tx.participante.update({
                where: { id, contaId },
                data: {
                    ...data,
                    cpf: data.cpf || null,
                    whatsappNumero: data.whatsappNumero || null,
                    // Only update userId if we found a match, otherwise keep existing (or null)
                    ...(userIdToLink && { userId: userIdToLink })
                },
            });

            // Create notification inside transaction
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null, // Broadcast para Admins
                    tipo: "participante_editado",
                    titulo: `Participante atualizado`,
                    descricao: `As informações de ${updated.nome} foram atualizadas por ${userId}.${userIdToLink ? " Usuário vinculado com sucesso." : ""}`,
                    entidadeId: updated.id,
                    lida: false
                }
            });

            // If linked to a user, notify them as well
            if (userIdToLink && userIdToLink !== userId) {
                await tx.notificacao.create({
                    data: {
                        contaId, // Context of the account where they are a participant
                        usuarioId: userIdToLink,
                        tipo: "participante_criado", // Reusing this type or add new enum value
                        titulo: "Perfil Vinculado",
                        descricao: `Seu perfil foi vinculado à conta de ${updated.nome}.`,
                        entidadeId: updated.id,
                        lida: false
                    }
                });
            }

            return updated;
        });

        revalidatePath("/participantes");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[UPDATE_PARTICIPANTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao atualizar participante" };
    }
}

export async function deleteParticipante(id: number) {
    try {
        const { contaId, userId } = await getContext();

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

            // Soft delete the participant
            await tx.participante.update({
                where: { id, contaId },
                data: {
                    deletedAt: new Date()
                }
            });

            // Create notification inside transaction
            await tx.notificacao.create({
                data: {
                    contaId,
                    usuarioId: null, // Broadcast para Admins
                    tipo: "participante_excluido",
                    titulo: `Participante removido`,
                    descricao: `${participante.nome} foi removido do sistema por ${userId}.`,
                    entidadeId: id,
                    lida: false
                }
            });
        });

        revalidatePath("/participantes");
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_PARTICIPANTE_ERROR]", error);
        return { success: false, error: error.message || "Erro ao deletar participante" };
    }
}

export async function getParticipanteById(id: number) {
    try {
        const { contaId } = await getContext();

        const data = await prisma.participante.findUnique({
            where: { id, contaId },
            include: {
                assinaturas: {
                    where: { deletedAt: null },
                    include: {
                        streaming: {
                            include: {
                                catalogo: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!data) {
            return { success: false, error: "Participante não encontrado" };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("[GET_PARTICIPANTE_BY_ID_ERROR]", error);
        return { success: false, error: "Erro ao buscar detalhes do participante" };
    }
}
