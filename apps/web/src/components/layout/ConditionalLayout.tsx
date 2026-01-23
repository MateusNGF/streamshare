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

    // Pages that should NOT show the sidebar
    const publicPages = ["/", "/login", "/esqueci-senha"];
    const isPublicPage = publicPages.includes(pathname);

    // Admin pages have their own AdminSidebar
    const isAdminPage = pathname.startsWith("/admin");

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <>
            {isAdminPage ? <AdminSidebar /> : <Sidebar isSystemAdmin={isSystemAdmin} />}
            <main id="main-content" className="flex-1 min-w-0 h-screen overflow-y-auto">
                {children}
            </main>
        </>
    );
}
