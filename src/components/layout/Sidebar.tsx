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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { MobileMenuButton } from "./MobileMenuButton";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface SidebarProps {
    isSystemAdmin?: boolean;
}

export function Sidebar({ isSystemAdmin = false }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { unreadCount, refreshCount } = useUnreadNotifications();

    // Refresh count when modal closes
    const handleCloseNotifications = async () => {
        setIsNotificationsOpen(false);
        await refreshCount();
    };

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
                    <NotificationBell
                        unreadCount={unreadCount}
                        onClick={() => setIsNotificationsOpen(true)}
                    />
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
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/assets/logo-branca.jpg"
                            alt="StreamShare"
                            width={40}
                            height={40}
                            className="rounded-lg transition-transform hover:scale-110 duration-300"
                        />
                        <span className="text-xl font-bold text-gray-900">StreamShare</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-2" aria-label="Menu principal">
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

                <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                    {/* Desktop Notification Button */}
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="hidden lg:flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 hover:translate-x-1 transition-all duration-200 touch-manipulation group"
                    >
                        <div className="relative">
                            <NotificationBell
                                unreadCount={unreadCount}
                                isInteractive={false}
                                className="p-0 text-gray-400 group-hover:text-gray-500 group-hover:scale-110 transition-transform duration-200" // Match sidebar icon styles
                                badgeClassName="-top-1 -right-2 h-[16px] min-w-[16px] text-[9px]" // Adjust badge for smaller icon container
                            />
                        </div>
                        <span>Notificações</span>
                    </button>

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

                {/* Notifications Modal */}
                <NotificationsModal
                    isOpen={isNotificationsOpen}
                    onClose={handleCloseNotifications}
                />
            </div>
        </>
    );
}
