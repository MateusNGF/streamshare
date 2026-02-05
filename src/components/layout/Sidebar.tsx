"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Tv,
    CreditCard,
    Settings,
    LogOut,
    FileSignature,
    ShieldCheck,
    FolderOpen,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal"; // New Import
import { MobileMenuButton } from "./MobileMenuButton";

interface SidebarProps {
    isSystemAdmin?: boolean;
}

export function Sidebar({ isSystemAdmin = false }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // New State
    const [loading, setLoading] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Users, label: "Participantes", href: "/participantes" },
        { icon: Tv, label: "Streamings", href: "/streamings" },
        { icon: FileSignature, label: "Assinaturas", href: "/assinaturas" },
        { icon: CreditCard, label: "Cobranças", href: "/cobrancas" },
        { icon: FolderOpen, label: "Grupos", href: "/grupos" },
        { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ];

    if (isSystemAdmin) {
        menuItems.push({ icon: ShieldCheck, label: "Painel Admin", href: "/admin/parametros" });
    }

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
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={45}
                        height={45}
                        className="rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNotificationsOpen(true)} // Wired onClick
                        aria-label="Notificações"
                        className="p-2 text-gray-500 hover:text-gray-900 relative touch-manipulation"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                </div>
            </header>
            {/* Mobile Menu Button */}


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
                <div className="p-6 flex items-center gap-3">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                    <span className="text-xl font-bold text-gray-900">StreamShare</span>
                </div>

                <nav className="flex-1 px-4 mt-6" aria-label="Menu principal">
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

                {/* Notifications Modal */}
                <NotificationsModal
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            </div>
        </>
    );
}
