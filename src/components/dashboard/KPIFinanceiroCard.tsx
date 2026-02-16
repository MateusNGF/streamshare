'use client';

import { LucideIcon } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface KPIFinanceiroCardProps {
    titulo: string;
    valor: number;
    icone: LucideIcon;
    cor: "primary" | "green" | "red";
    isMoeda?: boolean;
    index?: number;
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

export function KPIFinanceiroCard({ titulo, valor, icone: Icon, cor, isMoeda = true, index = 0 }: KPIFinanceiroCardProps) {
    const { format } = useCurrency();
    const config = corConfig[cor];

    return (
        <div
            className={`relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/20 rounded-[32px] p-7 shadow-sm hover:shadow-2xl ${config.shadow} hover:-translate-y-2 transition-all duration-500 group animate-scale-in`}
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
        >
            {/* Efeito decorativo de fundo */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl ${config.iconBg}`} />

            <div className={`relative inline-flex p-4 rounded-2xl ${config.iconBg} ${config.icon} mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="relative text-3xl font-black text-gray-900 mb-2 tracking-tighter">
                {isMoeda ? format(valor) : valor.toLocaleString('pt-BR')}
            </div>
            <div className="relative text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{titulo}</div>
        </div>
    );
}
