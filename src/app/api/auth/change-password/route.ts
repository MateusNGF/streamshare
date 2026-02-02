import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * API Route: Change Password (Logged-in User)
 * 
 * Permite que usuários autenticados alterem suas senhas.
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validações básicas
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Senhas são obrigatórias" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "A nova senha deve ter no mínimo 8 caracteres" },
                { status: 400 }
            );
        }

        if (currentPassword === newPassword) {
            return NextResponse.json(
                { error: "A nova senha deve ser diferente da senha atual" },
                { status: 400 }
            );
        }

        // Buscar usuário completo do banco
        const user = await prisma.usuario.findUnique({
            where: { id: currentUser.userId },
            select: {
                id: true,
                senhaHash: true,
            },
        });

        if (!user || !user.senhaHash) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        // Validar senha atual
        const isValid = await bcrypt.compare(currentPassword, user.senhaHash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Senha atual incorreta" },
                { status: 400 }
            );
        }

        // Hash da nova senha
        const senhaHash = await bcrypt.hash(newPassword, 10);

        // Atualizar senha no banco
        await prisma.usuario.update({
            where: { id: user.id },
            data: { senhaHash },
        });

        return NextResponse.json({
            message: "Senha alterada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao processar change-password:", error);
        return NextResponse.json(
            { error: "Erro ao processar solicitação" },
            { status: 500 }
        );
    }
}
