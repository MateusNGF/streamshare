'use client';

import { LucideIcon } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface KPIFinanceiroCardProps {
    titulo: string;
    valor: number;
    icone: LucideIcon;
    cor: "primary" | "green" | "red";
}

const corConfig: Record<"primary" | "green" | "red", { iconBg: string; shadow: string; icon: string }> = {
    primary: {
        iconBg: "bg-gradient-to-br from-primary/20 to-primary/5",
        shadow: "shadow-primary/20",
        icon: "text-primary"
    },
    green: {
        iconBg: "bg-gradient-to-br from-green-100 to-green-50",
        shadow: "shadow-green-500/10",
        icon: "text-green-600"
    },
    red: {
        iconBg: "bg-gradient-to-br from-red-100 to-red-50",
        shadow: "shadow-red-500/10",
        icon: "text-red-600"
    }
};

export function KPIFinanceiroCard({ titulo, valor, icone: Icon, cor }: KPIFinanceiroCardProps) {
    const { format } = useCurrency();
    const config = corConfig[cor];

    return (
        <div className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl ${config.shadow} hover:-translate-y-1 transition-all duration-300 group`}>
            <div className={`inline-flex p-3 rounded-2xl ${config.iconBg} ${config.icon} mb-4 transition-transform group-hover:scale-110 duration-300 shadow-inner`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
                {format(valor)}
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{titulo}</div>
        </div>
    );
}
