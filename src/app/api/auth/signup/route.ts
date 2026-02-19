import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nome, email, senha, termsAccepted, termsVersion, privacyAccepted, privacyVersion } = body;

        // Validate input
        if (!nome || !email || !senha) {
            return NextResponse.json(
                { error: "Nome, email e senha são obrigatórios" },
                { status: 400 }
            );
        }

        if (!termsAccepted || !privacyAccepted) {
            return NextResponse.json(
                { error: "Você deve aceitar os termos de uso e a política de privacidade para criar uma conta." },
                { status: 400 }
            );
        }

        if (senha.length < 6) {
            return NextResponse.json(
                { error: "Senha deve ter no mínimo 6 caracteres" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(senha);

        // Create user and account in a transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.usuario.create({
                data: {
                    nome,
                    email,
                    senhaHash: hashedPassword,
                    termsAcceptedAt: new Date(),
                    termsVersion: termsVersion || "1.0.0",
                    privacyAcceptedAt: new Date(),
                    privacyVersion: privacyVersion || "1.0.0",
                },
            });

            const newConta = await tx.conta.create({
                data: {
                    nome: `Conta de ${nome}`,
                    email: email, // Use user email for account email
                    plano: "free",
                },
            });

            await tx.contaUsuario.create({
                data: {
                    contaId: newConta.id,
                    usuarioId: newUser.id,
                    nivelAcesso: "owner",
                },
            });

            return {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                createdAt: newUser.createdAt,
                sessionVersion: newUser.sessionVersion,
            };
        });

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            sessionVersion: user.sessionVersion,
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            message: "Usuário criado com sucesso",
            user,
        }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}
