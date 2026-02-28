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
    Home,
    Menu,
    X
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
                <Link href="/" className="flex items-center gap-2 group/logo cursor-pointer">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={32}
                        height={32}
                        className="rounded-lg transition-transform group-hover/logo:scale-110 duration-300"
                    />
                    <span className="text-sm font-bold text-gray-900 group-hover/logo:text-primary transition-colors">Painel Admin</span>
                </Link>
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

            {/* 2. Drawer/Gaveta Mobile (Bottom Sheet) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[48] lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    "fixed bottom-16 left-0 right-0 z-[49] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out lg:hidden max-h-[75vh] flex flex-col",
                    isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 ml-2">Menu Completo</h2>
                    <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <h3 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">
                                Administração
                            </h3>
                            <ul className="space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    // Pular itens que já estão na bottom bar
                                    if (item.href === "/admin/catalogo" || item.href === "/admin/usuarios" || item.href === "/admin/reports") return null;

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={closeMobileMenu}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary text-white shadow-md shadow-primary/10"
                                                        : "text-gray-600 hover:bg-gray-50 active:scale-95"
                                                )}
                                            >
                                                <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                                                <span className="font-medium text-[14px]">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link
                            href="/dashboard/provedor"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-[14px] text-gray-600 hover:bg-gray-50 active:scale-95 transition-all duration-200 mb-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            <span>Voltar ao Dashboard</span>
                        </Link>
                        <button
                            onClick={() => { closeMobileMenu(); setIsLogoutModalOpen(true); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-[14px] text-red-500 hover:bg-red-50 active:scale-95 transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* 3. Bottom Navigation Bar Mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] h-16 bg-white border-t border-gray-100 grid grid-cols-5 items-center px-1 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
                {/* 1. Catálogo */}
                <Link
                    href="/admin/catalogo"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/admin/catalogo" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/admin/catalogo" && "bg-primary/10")}>
                        <Play size={22} className={pathname === "/admin/catalogo" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/admin/catalogo" && "font-bold")}>
                        Catálogo
                    </span>
                </Link>

                {/* 2. Usuários */}
                <Link
                    href="/admin/usuarios"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/admin/usuarios" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/admin/usuarios" && "bg-primary/10")}>
                        <User size={22} className={pathname === "/admin/usuarios" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/admin/usuarios" && "font-bold")}>
                        Usuários
                    </span>
                </Link>

                {/* 3. Início (FAB / Botão Principal Maior) */}
                <div className="relative flex items-center justify-center w-full h-full">
                    <Link
                        href="/admin/parametros"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute -top-5 flex flex-col items-center justify-center group"
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[4px] border-white transition-transform active:scale-95",
                            pathname === "/admin/parametros"
                                ? "bg-primary text-white shadow-primary/30"
                                : "bg-gray-900 text-white shadow-gray-200"
                        )}>
                            <Home size={26} className={pathname === "/admin/parametros" ? "fill-white/80" : ""} />
                        </div>
                    </Link>
                    <span className={cn("absolute bottom-1.5 text-[10px] font-medium transition-colors", pathname === "/admin/parametros" ? "text-primary font-bold" : "text-gray-400")}>
                        Início
                    </span>
                </div>

                {/* 4. Reports */}
                <Link
                    href="/admin/reports"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/admin/reports" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/admin/reports" && "bg-primary/10")}>
                        <MessageCircleQuestion size={22} className={pathname === "/admin/reports" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/admin/reports" && "font-bold")}>
                        Reports
                    </span>
                </Link>

                {/* 5. Botão para abrir o Menu Restante */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        isMobileMenuOpen ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", isMobileMenuOpen && "bg-primary/10")}>
                        <Menu size={22} className={isMobileMenuOpen ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", isMobileMenuOpen && "font-bold")}>
                        Menu
                    </span>
                </button>
            </nav>

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
