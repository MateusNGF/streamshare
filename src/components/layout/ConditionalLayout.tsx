"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AdminSidebar } from "../admin/AdminSidebar";

export function ConditionalLayout({
    children,
    isSystemAdmin = false
}: {
    children: React.ReactNode;
    isSystemAdmin?: boolean;
}) {
    const pathname = usePathname();

    // Routes that SHOULD show a sidebar
    const dashboardRoutes = ["/dashboard", "/assinaturas", "/cobrancas", "/participantes", "/planos", "/streamings", "/configuracoes"];
    const isDashboardPage = dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
    const isAdminPage = pathname.startsWith("/admin");

    const showSidebar = isDashboardPage || isAdminPage;

    if (!showSidebar) {
        return (
            <div className="flex flex-col min-h-screen w-full bg-gray-50">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {isAdminPage ? <AdminSidebar /> : <Sidebar isSystemAdmin={isSystemAdmin} />}
            <main id="main-content" className="flex-1 min-w-0 h-screen overflow-y-auto">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
