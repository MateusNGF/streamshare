import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { generateToken, verifyToken, JWTPayload } from "./jwt";

// Re-export for convenience if needed, but prefer strict separation
export { generateToken, verifyToken, type JWTPayload };

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("auth-token")?.value || null;
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Validate session in DB
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: payload.userId },
            select: { sessionVersion: true }
        });

        if (!user || user.sessionVersion !== payload.sessionVersion) {
            return null; // Session invalid or user deleted
        }

        return payload;
    } catch (error) {
        console.error("Session validation error:", error);
        return null;
    }
}
