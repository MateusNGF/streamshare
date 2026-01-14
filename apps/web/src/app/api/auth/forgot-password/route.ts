import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamshare/database";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * API Route: Forgot Password
 * 
 * Gera um token de reset de senha e envia email para o usuário.
 * Por segurança, sempre retorna sucesso mesmo se o email não existir.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validação básica
        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        // Buscar usuário por email
        const user = await prisma.usuario.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                nome: true,
                email: true,
            },
        });

        // Se usuário existe, gerar token e enviar email
        if (user) {
            // Gerar token seguro
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

            // Salvar token no banco
            await prisma.usuario.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpiry,
                },
            });

            // Enviar email
            const emailResult = await sendPasswordResetEmail(
                user.email,
                resetToken,
                user.nome
            );

            if (!emailResult.success) {
                console.error("Erro ao enviar email:", emailResult.error);
                // Não retornar erro para o usuário por segurança
            }
        }

        // Sempre retornar sucesso (segurança - previne enumeração de usuários)
        return NextResponse.json({
            message: "Se o email existir, você receberá instruções para redefinir sua senha."
        });

    } catch (error) {
        console.error("Erro ao processar forgot-password:", error);
        return NextResponse.json(
            { error: "Erro ao processar solicitação" },
            { status: 500 }
        );
    }
}
