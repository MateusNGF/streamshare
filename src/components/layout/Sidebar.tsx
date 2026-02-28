"use client";

import { useState, useEffect } from "react";
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
    Compass,
    Wallet,
    Menu,
    X,
    Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { PlanoConta } from "@prisma/client";

interface SidebarProps {
    isSystemAdmin?: boolean;
    userPlan?: PlanoConta;
}

export function Sidebar({ isSystemAdmin = false, userPlan = "free" as PlanoConta }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { unreadCount, refreshCount } = useUnreadNotifications();

    const handleCloseNotifications = async () => {
        setIsNotificationsOpen(false);
        await refreshCount();
    };

    const isFreePlan = userPlan === "free";
    const showManagement = userPlan !== "free";

    // Lógica do botão Home dependendo do plano
    const homeHref = showManagement ? "/dashboard/provedor" : "/dashboard/participante";

    const menuGroups = [
        {
            label: "Geral",
            items: [
                { icon: Compass, label: "Explorar", href: "/explore" },
            ]
        },
        {
            label: "Usuário",
            items: [
                { icon: LayoutDashboard, label: "Painel Participante", href: "/dashboard/participante" },
                { icon: Wallet, label: "Faturas", href: "/faturas" },
            ]
        },
        ...(showManagement ? [{
            label: "Conta",
            items: [
                { icon: LayoutDashboard, label: "Visão Provedor", href: "/dashboard/provedor" },
                { icon: Tv, label: "Streamings", href: "/streamings" },
                { icon: FileSignature, label: "Assinaturas", href: "/assinaturas" },
                { icon: CreditCard, label: "Cobranças", href: "/cobrancas" },
                { icon: FileSignature, label: "Lotes", href: "/cobrancas/lotes" },
                { icon: Users, label: "Participantes", href: "/participantes" },
                { icon: FolderOpen, label: "Grupos", href: "/grupos" },
            ]
        }] : []),
        {
            label: "Sistema",
            items: [
                { icon: Settings, label: "Configurações", href: "/configuracoes" },
                ...(isSystemAdmin ? [{ icon: ShieldCheck, label: "Painel Admin", href: "/admin/parametros" }] : []),
            ]
        }
    ];

    // Filtra itens para não repetir no menu Mobile (gaveta) os que já estão na barra inferior
    const bottomNavHrefs = [homeHref, "/explore", "/faturas", "/configuracoes"];

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

    // Fecha a gaveta mobile automaticamente se a rota mudar
    useEffect(() => {
        closeMobileMenu();
    }, [pathname]);

    return (
        <>
            {/* =========================================================
                MOBILE LAYOUT
            ========================================================= */}

            {/* 1. Top Header Mobile (Apenas Logo e Notificação) */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-[45] h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                <Link href={homeHref} className="transition-transform hover:scale-105 duration-300 cursor-pointer flex items-center gap-3 group">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare"
                        width={35}
                        height={35}
                        className="rounded-lg"
                    />
                    <span className="text-lg font-bold text-gray-900">StreamShare</span>
                </Link>
                <NotificationBell
                    unreadCount={unreadCount}
                    onClick={() => setIsNotificationsOpen(true)}
                />
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
                        {menuGroups.map((group) => {
                            // Filtra os itens que não devem aparecer na gaveta porque já estão na base
                            const filteredItems = group.items.filter(item => !bottomNavHrefs.includes(item.href));
                            if (filteredItems.length === 0) return null;

                            return (
                                <div key={group.label} className="flex flex-col gap-1">
                                    <h3 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">
                                        {group.label}
                                    </h3>
                                    <ul className="space-y-1">
                                        {filteredItems.map((item) => {
                                            const isActive = pathname === item.href;
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
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        {isFreePlan && (
                            <div className="mb-4">
                                <UpgradeBanner
                                    variant="primary"
                                    size="compact"
                                    title="Desbloquear Gestão"
                                    description="Gerencie streamings."
                                    buttonText="Upgrade"
                                    layout="vertical"
                                    className="shadow-none border-indigo-50/50 bg-indigo-50/20"
                                />
                            </div>
                        )}
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
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
                {/* 1. Explorar */}
                <Link
                    href="/explore"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/explore" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/explore" && "bg-primary/10")}>
                        <Compass size={22} className={pathname === "/explore" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/explore" && "font-bold")}>
                        Explorar
                    </span>
                </Link>

                {/* 2. Faturas */}
                <Link
                    href="/faturas"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/faturas" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/faturas" && "bg-primary/10")}>
                        <Wallet size={22} className={pathname === "/faturas" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/faturas" && "font-bold")}>
                        Faturas
                    </span>
                </Link>

                {/* 3. Início (FAB / Botão Principal Maior) */}
                <div className="relative flex items-center justify-center w-full h-full">
                    <Link
                        href={homeHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute -top-5 flex flex-col items-center justify-center group"
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[4px] border-white transition-transform active:scale-95",
                            pathname === homeHref
                                ? "bg-primary text-white shadow-primary/30"
                                : "bg-gray-900 text-white shadow-gray-200"
                        )}>
                            <Home size={26} className={pathname === homeHref ? "fill-white/80" : ""} />
                        </div>
                    </Link>
                    <span className={cn("absolute bottom-1.5 text-[10px] font-medium transition-colors", pathname === homeHref ? "text-primary font-bold" : "text-gray-400")}>
                        Início
                    </span>
                </div>

                {/* 4. Ajustes */}
                <Link
                    href="/configuracoes"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 pt-1",
                        pathname === "/configuracoes" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <div className={cn("p-1.5 rounded-full transition-all duration-300", pathname === "/configuracoes" && "bg-primary/10")}>
                        <Settings size={22} className={pathname === "/configuracoes" ? "text-primary" : "text-current"} />
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", pathname === "/configuracoes" && "font-bold")}>
                        Ajustes
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

            {/* =========================================================
                DESKTOP LAYOUT (Permanece igual)
            ========================================================= */}
            <div className="hidden lg:flex w-64 bg-white border-r h-screen flex-col z-[42] shadow-none">
                <div className="p-6 flex items-center justify-between">
                    <Link href={homeHref} className="flex items-center gap-3 group/logo cursor-pointer">
                        <Image
                            src="/assets/logo-branca.jpg"
                            alt="StreamShare"
                            width={40}
                            height={40}
                            className="rounded-lg transition-transform group-hover/logo:scale-110 duration-300"
                        />
                        <span className="text-xl font-bold text-gray-900 group-hover/logo:text-primary transition-colors">StreamShare</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 mt-2 overflow-y-auto pb-4 scrollbar-hide">
                    <div className="flex flex-col gap-6">
                        {menuGroups.map((group) => (
                            <div key={group.label} className="flex flex-col gap-1">
                                <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">
                                    {group.label}
                                </h3>
                                <ul className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-200 group cursor-pointer",
                                                        isActive
                                                            ? "bg-primary text-white shadow-md shadow-primary/10"
                                                            : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900 hover:translate-x-1"
                                                    )}
                                                >
                                                    <item.icon size={18} className={cn(
                                                        "transition-transform duration-200",
                                                        isActive ? "text-white" : "text-gray-400 group-hover:scale-110"
                                                    )} />
                                                    <span className="font-medium text-[13.5px]">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>

                {isFreePlan && (
                    <div className="px-4 mb-4">
                        <UpgradeBanner
                            variant="primary"
                            size="compact"
                            title="Desbloquear Gestão"
                            description="Gerencie streamings e cobranças."
                            buttonText="Upgrade"
                            layout="vertical"
                            className="shadow-none border-indigo-50/50 bg-indigo-50/20"
                        />
                    </div>
                )}

                <div className="p-4 border-t border-gray-100 flex flex-col gap-1">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="flex items-center gap-2.5 w-full px-4 py-2 rounded-lg font-medium text-[13.5px] text-gray-500 hover:bg-gray-50/80 hover:translate-x-1 transition-all duration-200 group"
                    >
                        <NotificationBell
                            unreadCount={unreadCount}
                            isInteractive={false}
                            className="p-0 text-gray-400 group-hover:text-gray-500 group-hover:scale-110 transition-transform duration-200"
                            badgeClassName="-top-1 -right-2 h-[16px] min-w-[16px] text-[9px]"
                        />
                        <span>Notificações</span>
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center gap-2.5 w-full px-4 py-2 rounded-lg font-medium text-[13.5px] text-red-500 hover:bg-red-50/80 hover:translate-x-1 transition-all duration-200 group"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
                        <span>Sair</span>
                    </button>
                </div>
            </div>

            {/* Modais Globais */}
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                loading={loading}
            />
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={handleCloseNotifications}
            />
        </>
    );
}
