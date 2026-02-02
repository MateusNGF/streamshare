import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        // Get full user data
        const user = await prisma.usuario.findUnique({
            where: { id: currentUser.userId },
            select: {
                id: true,
                nome: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Get current user error:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuário" },
            { status: 500 }
        );
    }
}
