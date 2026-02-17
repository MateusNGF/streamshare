import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    const { pathname } = request.nextUrl;

    const payload = token ? verifyToken(token) : null;

    // IP Verification (Basic)
    if (payload && payload.clientIp) {
        const currentIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        // Localhost normalization (optional but helpful for dev)
        const isLocalhost = currentIp === "::1" || currentIp === "127.0.0.1";
        const isPayloadLocal = payload.clientIp === "::1" || payload.clientIp === "127.0.0.1";

        // Only block if both are known, not localhost (or both are different non-localhosts), and different.
        const shouldCheckIp = currentIp !== "unknown" && payload.clientIp !== "unknown";

        if (shouldCheckIp && !(isLocalhost && isPayloadLocal) && currentIp !== payload.clientIp) {
            const response = NextResponse.redirect(new URL("/login?reason=ip_change", request.url));
            response.cookies.delete("auth-token");
            return response;
        }
    }

    // Define protected routes prefix
    const protectedPrefixes = [
        "/dashboard",
        "/participantes",
        "/streamings",
        "/cobrancas",
        "/configuracoes",
        "/checkout",
        "/admin"
    ];

    const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    // 1. If user is logged in and tries to access login page, redirect to dashboard
    if (payload && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT logged in and tries to access protected routes, redirect to login
    if (!payload && isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        if (token) {
            response.cookies.delete("auth-token");
        }
        return response;
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
