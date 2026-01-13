import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    const { pathname } = request.nextUrl;

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

    // 1. If user is logged in and tries to access public routes (except landing sometimes, but usually login/signup), redirect to dashboard
    if (token && isPublicRoute && pathname !== "/esqueci-senha") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT logged in and tries to access protected routes, redirect to login
    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
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
