import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { SignJWT } from "jose";
import { sendOTP } from "@/lib/verification-service";
import { encodedSecret } from "@/lib/jwt";

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

        // Generate a temporary token for pending registration
        // Expires in 15 minutes
        const pendingToken = await new SignJWT({
            nome,
            email,
            senhaHash: hashedPassword,
            termsVersion: termsVersion || "1.0.0",
            privacyVersion: privacyVersion || "1.0.0",
            type: "PENDING_SIGNUP"
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(encodedSecret);


        try {
            // Send OTP purely on the server to guarantee consistency
            await sendOTP(email, "EMAIL");
        } catch (otpErr) {
            console.error("Signup: Erro ao enviar OTP inicial", otpErr);
            // We ignore OTP error here because user can resend from the modal using pendingToken
        }

        return NextResponse.json({
            message: "Código de verificação enviado",
            pendingToken,
            email
        }, { status: 200 });


    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}
