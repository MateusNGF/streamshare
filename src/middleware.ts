import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    const { pathname } = request.nextUrl;

    // IP Verification (Basic)
    const payload = token ? verifyToken(token) : null;

    // IP Verification (Basic)
    if (payload && payload.clientIp) {
        const currentIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        // Allow unknown or matching IP. If strict, uncomment throwing error.
        if (currentIp !== "unknown" && payload.clientIp !== "unknown" && currentIp !== payload.clientIp) {
            // Suspicious login attempt from different IP?
            // For now, let's just log it or (if strict) redirect to login.
            // In production, this might be too strict for mobile users switching networks.
            // The requirement is "drastically different". Without GeoIP, strict equality is the only easy check.
            // User said "Bloqueio de Múltiplos IPs Simultâneos".
            // We will implement strict check but maybe allow a small grace period or just invalidate.
            // For this implementation, let's invalidate and ask for re-login with a query param.
            const response = NextResponse.redirect(new URL("/login?reason=ip_change", request.url));
            response.cookies.delete("auth-token");
            return response;
        }
    }

    // Define public and protected routes
    const publicRoutes = ["/", "/login", "/esqueci-senha"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Protected routes prefix (all routes except the ones in the matcher and public routes)
    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/participantes") ||
        pathname.startsWith("/streamings") ||
        pathname.startsWith("/cobrancas") ||
        pathname.startsWith("/configuracoes");

    // 1. If user is logged in and tries to access login page, redirect to dashboard
    if (payload && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT logged in and tries to access protected routes, redirect to login
    if (!payload && isProtectedRoute) {
        // If token exists but is invalid/expired, we should probably clear it?
        // But for now, just redirecting is safe. The browser will eventually overwrite or we can clear it.
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
