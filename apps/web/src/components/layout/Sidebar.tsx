"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Tv,
    CreditCard,
    Settings,
    Play
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Participantes", href: "/participantes" },
    { icon: Tv, label: "Streamings", href: "/streamings" },
    { icon: CreditCard, label: "Cobranças", href: "/cobrancas" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white border-r h-screen flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Play className="text-white fill-white" size={24} />
                </div>
                <span className="text-xl font-bold text-gray-900">StreamShare</span>
            </div>

            <nav className="flex-1 px-4 mt-6">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
