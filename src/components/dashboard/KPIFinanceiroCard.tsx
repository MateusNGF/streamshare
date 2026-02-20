'use client';

import { LucideIcon, HelpCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { Tooltip } from "@/components/ui/Tooltip";

interface KPIFinanceiroCardProps {
    titulo: string;
    valor: number;
    icone: LucideIcon;
    cor: "primary" | "green" | "red";
    isMoeda?: boolean;
    index?: number;
    tooltip?: string;
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

export function KPIFinanceiroCard({ titulo, valor, icone: Icon, cor, isMoeda = true, index = 0, tooltip }: KPIFinanceiroCardProps) {
    const { format } = useCurrency();
    const config = corConfig[cor];

    return (
        <div
            className={`relative overflow-hidden h-full bg-white/70 backdrop-blur-xs border border-white/20 rounded-[32px] p-7 shadow-sm hover:shadow-xl ${config.shadow} hover:-translate-y-1.5 transition-all duration-500 group animate-scale-in flex flex-row items-center justify-start gap-4 cursor-default`}
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
        >
            {/* Efeito decorativo de fundo */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 ${config.iconBg}`} />

            <div className="relative">
                <div className={`inline-flex p-4 rounded-2xl ${config.iconBg} ${config.icon}  transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="relative">
                <div className="text-3xl font-black text-gray-900 mb-2 tracking-tighter leading-none">
                    {isMoeda ? format(valor) : valor.toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{titulo}</div>
                    {tooltip && (
                        <Tooltip content={tooltip}>
                            <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                <HelpCircle size={12} />
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
}
