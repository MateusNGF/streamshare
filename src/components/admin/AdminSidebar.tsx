"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Play,
    Settings,
    LogOut,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { MobileMenuButton } from "../layout/MobileMenuButton";

const menuItems = [
    { icon: Play, label: "Catálogo", href: "/admin/catalogo" },
    { icon: Settings, label: "Parâmetros", href: "/admin/parametros" },
    { icon: User, label: "Usuários", href: "/admin/usuarios" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
            setIsLogoutModalOpen(false);
        }
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed lg:static w-64 bg-white border-r h-screen flex flex-col z-[42] transition-transform duration-300 lg:transform-none",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="p-6 flex items-center gap-3 border-b">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900">StreamShare</span>
                        <span className="text-xs text-gray-500 font-medium">Administração</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-6" aria-label="Menu administrativo">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeMobileMenu}
                                        aria-label={item.label}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-manipulation",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all touch-manipulation mb-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        <span>Voltar ao Dashboard</span>
                    </Link>
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        aria-label="Sair da conta"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all touch-manipulation"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>

                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={handleLogout}
                    loading={loading}
                />
            </div>
        </>
    );
}
