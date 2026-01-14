"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages that should NOT show the sidebar
    const publicPages = ["/", "/login", "/esqueci-senha"];
    const isPublicPage = publicPages.includes(pathname);

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <main id="main-content" className="flex-1 min-w-0 h-screen overflow-y-auto">
                {children}
            </main>
        </>
    );
}
