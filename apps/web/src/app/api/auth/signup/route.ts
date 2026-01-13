import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamshare/database";
import { hashPassword } from "@/lib/password";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nome, email, senha } = body;

        // Validate input
        if (!nome || !email || !senha) {
            return NextResponse.json(
                { error: "Nome, email e senha são obrigatórios" },
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

        // Create user
        const user = await prisma.usuario.create({
            data: {
                nome,
                email,
                senhaHash: hashedPassword,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
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
