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
    Bell,
    MessageCircleQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { MobileMenuButton } from "../layout/MobileMenuButton";

const menuItems = [
    { icon: Play, label: "Catálogo", href: "/admin/catalogo" },
    { icon: Settings, label: "Parâmetros", href: "/admin/parametros" },
    { icon: User, label: "Usuários", href: "/admin/usuarios" },
    { icon: MessageCircleQuestion, label: "Reports", href: "/admin/reports" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-[45] h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <MobileMenuButton
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                    <Link href="/" className="flex items-center gap-2 group/logo cursor-pointer">
                        <Image
                            src="/assets/logo-branca.jpg"
                            alt="StreamShare"
                            width={32}
                            height={32}
                            className="rounded-lg transition-transform group-hover/logo:scale-110 duration-300"
                        />
                        <span className="text-sm font-bold text-gray-900 group-hover/logo:text-primary transition-colors">Painel - StreamShare </span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        aria-label="Notificações"
                        className="p-2 text-gray-500 hover:text-gray-900 relative touch-manipulation"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </header>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in backdrop-blur-sm"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed lg:static w-64 bg-white border-r h-screen flex flex-col z-[42] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:transform-none shadow-2xl lg:shadow-none",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <Link href="/" className="p-6 flex items-center gap-3 border-b group/logo cursor-pointer">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={40}
                        height={40}
                        className="rounded-lg transition-transform group-hover/logo:scale-110 duration-300"
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 group-hover/logo:text-primary transition-colors">StreamShare</span>
                        <span className="text-xs text-gray-500 font-medium">Administração</span>
                    </div>
                </Link>

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
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 touch-manipulation group",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            "transition-transform duration-200",
                                            isActive ? "text-white" : "text-gray-400 group-hover:scale-110"
                                        )} />
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
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1 transition-all duration-200 touch-manipulation mb-2 group cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-200">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        <span>Voltar ao Dashboard</span>
                    </Link>
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        aria-label="Sair da conta"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 hover:translate-x-1 transition-all duration-200 touch-manipulation group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        <span>Sair</span>
                    </button>
                </div>

                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={handleLogout}
                    loading={loading}
                />
                <NotificationsModal
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            </div>
        </>
    );
}
