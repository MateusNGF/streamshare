"use server";

/**
 * OTP Server Actions
 * Client-safe interface for triggering and validating OTP codes.
 * Follows SOLID, Clean Code and ensures ACID compliance via transactions.
 */

import { z } from "zod";
import { sendOTP, validateOTP } from "@/lib/verification-service";
import { prisma } from "@/lib/db";
import { getCurrentUser, setAuthCookie, generateToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toE164 } from "@/lib/whatsapp-meta";
import { sendWelcomeEmail } from "@/lib/email";
import { jwtVerify } from "jose";
import { encodedSecret } from "@/lib/jwt";

// ---------------------------------------------------------------------------
// Schema validators (SRP: Validation decoupled)
// ---------------------------------------------------------------------------

const SendOtpSchema = z.object({
    destino: z.string().min(1),
    canal: z.enum(["EMAIL", "WHATSAPP"]),
});

const ValidateOtpSchema = z.object({
    destino: z.string().min(1),
    canal: z.enum(["EMAIL", "WHATSAPP"]),
    codigo: z.string().length(6).regex(/^\d{6}$/, "Código deve ter 6 dígitos numéricos"),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * requestOTP
 * Triggers a new OTP dispatch.
 */
export async function requestOTP(
    destino: string,
    canal: "EMAIL" | "WHATSAPP"
) {
    try {
        const parsed = SendOtpSchema.safeParse({ destino, canal });
        if (!parsed.success) {
            return { success: false, error: "Dados inválidos." };
        }

        const normalizedDestino =
            canal === "WHATSAPP" ? toE164(destino) : destino.toLowerCase().trim();

        return await sendOTP(normalizedDestino, canal);
    } catch (err: any) {
        console.error("[requestOTP]", err);
        return { success: false, error: "Erro interno. Tente novamente." };
    }
}

/**
 * verifyEmailOTP
 * Entry point for email verification.
 */
export async function verifyEmailOTP(destino: string, codigo: string, pendingToken?: string) {
    try {
        const parsed = ValidateOtpSchema.safeParse({ destino, canal: "EMAIL", codigo });
        if (!parsed.success) {
            return { success: false, error: "Código inválido. Deve ter 6 dígitos." };
        }

        const email = destino.toLowerCase().trim();

        // 1. Validate the OTP code
        const otpResult = await validateOTP(email, "EMAIL", codigo);
        if (!otpResult.success) return otpResult;

        // 2. Delegate based on purpose
        if (pendingToken) {
            return await handleSignupVerification(email, pendingToken);
        }

        return await handleExistingUserVerification(email);
    } catch (err: any) {
        console.error("[verifyEmailOTP]", err);
        return { success: false, error: "Erro ao verificar código." };
    }
}

/**
 * handleSignupVerification (Private helper)
 * Processes user creation after OTP validation.
 */
async function handleSignupVerification(email: string, pendingToken: string) {
    try {
        const { payload } = await jwtVerify(pendingToken, encodedSecret);
        const data = payload as any;

        if (data.type !== "PENDING_SIGNUP" || data.email !== email) {
            return { success: false, error: "Token de registro inválido." };
        }

        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) return { success: false, error: "Este e-mail já foi cadastrado." };

        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.usuario.create({
                data: {
                    nome: data.nome,
                    email: email,
                    senhaHash: data.senhaHash,
                    emailVerificado: true,
                    termsAcceptedAt: new Date(),
                    termsVersion: data.termsVersion,
                    privacyAcceptedAt: new Date(),
                    privacyVersion: data.privacyVersion,
                },
            });

            const newConta = await tx.conta.create({
                data: {
                    nome: `Conta de ${data.nome}`,
                    email: email,
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

            return newUser;
        });

        const token = await generateToken({
            userId: result.id,
            email: result.email,
            sessionVersion: result.sessionVersion,
        });
        await setAuthCookie(token);

        sendWelcomeEmail(result.email, result.nome).catch(console.error);

        return { success: true, message: "Conta criada e verificada!" };
    } catch (err: any) {
        console.error("[handleSignupVerification]", err);
        return { success: false, error: "Link de registro expirado ou inválido." };
    }
}

/**
 * handleExistingUserVerification (Private helper)
 * Marks an existing user as verified.
 */
async function handleExistingUserVerification(email: string) {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
        return { success: false, error: "Usuário não encontrado." };
    }

    if (user.emailVerificado) {
        return { success: true, message: "E-mail já verificado!" };
    }

    await prisma.usuario.update({
        where: { email },
        data: { emailVerificado: true },
    });

    // Notify user of verification success
    sendWelcomeEmail(user.email, user.nome).catch(console.error);

    return { success: true, message: "E-mail verificado com sucesso!" };
}


/**
 * verifyWhatsAppOTPForUsuario
 * Validates WhatsApp OTP for the logged user and updates profile (ACID).
 */
export async function verifyWhatsAppOTPForUsuario(numero: string, codigo: string) {
    try {
        const parsed = ValidateOtpSchema.safeParse({ destino: numero, canal: "WHATSAPP", codigo });
        if (!parsed.success) {
            return { success: false, error: "Código inválido." };
        }

        const session = await getCurrentUser();
        if (!session) return { success: false, error: "Não autenticado." };

        const e164 = toE164(numero);

        const result = await prisma.$transaction(async (tx) => {
            const validateRes = await validateOTP(e164, "WHATSAPP", codigo, tx);
            if (!validateRes.success) return validateRes;

            await tx.usuario.update({
                where: { id: session.userId },
                data: {
                    whatsappNumero: e164,
                    whatsappVerificado: true
                },
            });

            return { success: true };
        });

        if (result.success) revalidatePath("/configuracoes");
        return result;
    } catch (err: any) {
        console.error("[verifyWhatsAppOTPForUsuario]", err);
        return { success: false, error: "Erro ao vincular WhatsApp." };
    }
}

/**
 * verifyWhatsAppOTPForParticipante
 * Validates WhatsApp OTP for a specific participant (ACID).
 */
export async function verifyWhatsAppOTPForParticipante(
    participanteId: number,
    numero: string,
    codigo: string
) {
    try {
        const parsed = ValidateOtpSchema.safeParse({ destino: numero, canal: "WHATSAPP", codigo });
        if (!parsed.success) {
            return { success: false, error: "Código inválido." };
        }

        const e164 = toE164(numero);

        return await prisma.$transaction(async (tx) => {
            const result = await validateOTP(e164, "WHATSAPP", codigo, tx);

            if (!result.success) return result;

            await tx.participante.update({
                where: { id: participanteId },
                data: {
                    whatsappNumero: e164,
                    whatsappVerificado: true
                },
            });

            return { success: true };
        });
    } catch (err: any) {
        console.error("[verifyWhatsAppOTPForParticipante]", err);
        return { success: false, error: "Erro ao verificar WhatsApp do participante." };
    }
}
