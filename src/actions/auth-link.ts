"use server";

import { googleAuthService } from "@/services/google-auth.service";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function linkGoogleAccount(idToken: string) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            throw new Error("Não autenticado");
        }

        // 1. Verify Google Token
        const googlePayload = await googleAuthService.verifyIdToken(idToken);

        // 2. Security Check: Ensure the Google email matches the account email
        // Or at least check if the Google account is already linked to someone else.
        const existingLinkedUser = await prisma.usuario.findUnique({
            where: { email: googlePayload.email },
        });

        if (existingLinkedUser && existingLinkedUser.id !== session.userId) {
            throw new Error("Este e-mail do Google já está vinculado a outra conta.");
        }

        // 3. Link Account
        await prisma.usuario.update({
            where: { id: session.userId },
            data: {
                provider: "google",
                // We keep the email from session usually, but we could update it if they are linking.
                // For safety, let's just ensure they are now 'google' provider.
            }
        });

        revalidatePath("/configuracoes");
        return { success: true, message: "Conta do Google vinculada com sucesso!" };

    } catch (error: any) {
        console.error("[LINK_GOOGLE_ERROR]", error.message);
        return { success: false, error: error.message || "Erro ao vincular conta" };
    }
}

export async function unlinkGoogleAccount() {
    try {
        const session = await getCurrentUser();
        if (!session) throw new Error("Não autenticado");

        const user = await prisma.usuario.findUnique({
            where: { id: session.userId },
            select: { senhaHash: true }
        });

        if (!user?.senhaHash) {
            throw new Error("Você precisa definir uma senha antes de desvincular o Google para não perder o acesso.");
        }

        await prisma.usuario.update({
            where: { id: session.userId },
            data: { provider: "local" }
        });

        revalidatePath("/configuracoes");
        return { success: true, message: "Conta do Google desvinculada." };

    } catch (error: any) {
        console.error("[UNLINK_GOOGLE_ERROR]", error.message);
        return { success: false, error: error.message || "Erro ao desvincular conta" };
    }
}
