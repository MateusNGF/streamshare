import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, senha } = body;

        // Validate input
        if (!email || !senha) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user || !user.senhaHash) {
            return NextResponse.json(
                { error: "Credenciais inválidas" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(senha, user.senhaHash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Credenciais inválidas" },
                { status: 401 }
            );
        }

        // Extract IP and User Agent
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // Update user session info
        const updatedUser = await prisma.usuario.update({
            where: { id: user.id },
            data: {
                lastIp: clientIp,
                lastUserAgent: userAgent,
            },
            select: {
                id: true,
                email: true,
                sessionVersion: true,
            }
        });

        // Generate JWT token
        const token = await generateToken({
            userId: user.id,
            email: user.email,
            sessionVersion: updatedUser.sessionVersion,
            clientIp: clientIp,
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            message: "Login realizado com sucesso",
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Erro ao realizar login" },
            { status: 500 }
        );
    }
}
