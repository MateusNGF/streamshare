"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function acceptTerms(version: string) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return { success: false, error: "Não autenticado", code: "UNAUTHORIZED" };
        }

        await prisma.usuario.update({
            where: { id: session.userId },
            data: {
                termsAcceptedAt: new Date(),
                termsVersion: version,
            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("[ACCEPT_TERMS_ERROR]", error);
        return { success: false, error: "Erro ao aceitar termos" };
    }
}
