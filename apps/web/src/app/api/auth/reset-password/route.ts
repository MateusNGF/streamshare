import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamshare/database";
import bcrypt from "bcryptjs";

/**
 * API Route: Reset Password
 * 
 * Valida o token de reset e atualiza a senha do usuário.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, newPassword } = body;

        // Validações básicas
        if (!token || token.length < 10) {
            return NextResponse.json(
                { error: "Token inválido" },
                { status: 400 }
            );
        }

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json(
                { error: "A senha deve ter no mínimo 8 caracteres" },
                { status: 400 }
            );
        }

        // Buscar usuário com token válido e não expirado
        const user = await prisma.usuario.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token não expirado
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Token inválido ou expirado" },
                { status: 400 }
            );
        }

        // Hash da nova senha
        const senhaHash = await bcrypt.hash(newPassword, 10);

        // Atualizar senha e limpar token
        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                senhaHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({
            message: "Senha redefinida com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao processar reset-password:", error);
        return NextResponse.json(
            { error: "Erro ao processar solicitação" },
            { status: 500 }
        );
    }
}
