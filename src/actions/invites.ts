"use server";

import { getCurrentUser } from "@/lib/auth";
import { invitesService } from "@/services/invites-service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { StatusConvite } from "@prisma/client";

export async function inviteUser(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "Não autorizado" };

    const email = formData.get("email") as string;
    const contaId = parseInt(formData.get("contaId") as string);
    const streamingId = formData.get("streamingId") ? parseInt(formData.get("streamingId") as string) : undefined;
    const convidadoPorId = user.userId;

    if (!email || !contaId) return { error: "Dados inválidos" };

    try {
        await invitesService.createInvite(email, contaId, convidadoPorId, streamingId);
        revalidatePath(`/participantes`);
        return { success: true, message: "Convite enviado com sucesso!" };
    } catch (error) {
        console.error("Erro ao enviar convite:", error);
        return { error: "Erro ao enviar convite." };
    }
}

export async function acceptInvite(token: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Faça login para aceitar o convite" };

    const userId = user.userId;
    const userEmail = user.email;

    try {
        await invitesService.acceptInvite(token, userId, userEmail);
        revalidatePath('/dashboard');
        revalidatePath('/convites');
        return { success: true, message: "Convite aceito com sucesso!" };
    } catch (error: any) {
        console.error("Erro ao aceitar convite:", error);
        return { error: error.message || "Erro ao processar aceitação." };
    }
}

export async function getMyInvites() {
    const user = await getCurrentUser();
    if (!user) return [];

    const userId = user.userId;
    const email = user.email;

    if (!email) return [];

    const invites = await prisma.convite.findMany({
        where: {
            status: StatusConvite.pendente,
            OR: [
                { email: email },
                { usuarioId: userId }
            ]
        },
        include: {
            conta: { select: { nome: true } },
            streaming: {
                include: { catalogo: true }
            },
            convidadoPor: { select: { nome: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return invites;
}
