import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        // Increment sessionVersion to invalidate all tokens (including current)
        await prisma.usuario.update({
            where: { id: currentUser.userId },
            data: {
                sessionVersion: { increment: 1 }
            }
        });

        // Clear local cookie just to be clean, though token would be invalid anyway
        // But clearAuthCookie is not exported or accessible directly easily here without import
        // Actually we can just return success and let frontend handle redirect

        return NextResponse.json({
            message: "Todas as sessões foram invalidadas com sucesso."
        });

    } catch (error) {
        console.error("Remote logout error:", error);
        return NextResponse.json(
            { error: "Erro ao processar solicitação" },
            { status: 500 }
        );
    }
}
