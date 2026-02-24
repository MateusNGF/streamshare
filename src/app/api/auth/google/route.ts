import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { googleAuthService } from "@/services/google-auth.service";
import { AuthService } from "@/services/auth.service";
import { generateToken, setAuthCookie } from "@/lib/auth";

/**
 * Endpoint to authenticate user with Google ID Token.
 * Implements logic to find/create user and establish session.
 */
export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        // 1. Verify Google Token
        const googlePayload = await googleAuthService.verifyIdToken(idToken);

        // 2. Handle User Authentication / Registration
        const user = await AuthService.handleExternalAuth({
            email: googlePayload.email!,
            nome: googlePayload.name || googlePayload.email!.split("@")[0],
            picture: googlePayload.picture,
            provider: "google"
        });

        // 3. Extract Session Metadata
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // 4. Update Login Info and Get Clean User Data
        const sessionUser = await AuthService.updateLoginMetadata(user.id, {
            ip: clientIp,
            userAgent: userAgent
        });

        // 5. Generate and Set Session JWT
        const token = await generateToken({
            userId: sessionUser.id,
            email: sessionUser.email,
            sessionVersion: sessionUser.sessionVersion,
            clientIp: clientIp,
        });

        await setAuthCookie(token);

        return NextResponse.json({
            message: "Autenticação realizada com sucesso",
            user: {
                id: sessionUser.id,
                nome: sessionUser.nome,
                email: sessionUser.email,
            },
        });

    } catch (error: any) {
        console.error("[API_AUTH_GOOGLE_ERROR]", error.message);

        const status = error.message.includes("required") || error.message.includes("Invalid") ? 400 : 500;
        const publicMessage = status === 500 ? "Erro interno ao processar login" : error.message;

        return NextResponse.json(
            { error: publicMessage },
            { status }
        );
    }
}
