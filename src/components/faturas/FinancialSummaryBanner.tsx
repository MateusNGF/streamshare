"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { AlertCircle, Clock, CheckCircle2, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialSummaryBannerProps {
    faturas: any[];
}

export function FinancialSummaryBanner({ faturas }: FinancialSummaryBannerProps) {
    const { format } = useCurrency();

    const pendente = faturas
        .filter(f => f.status === "pendente" || f.status === "atrasado")
        .reduce((sum, f) => sum + Number(f.valor), 0);

    const aguardando = faturas
        .filter(f => f.status === "aguardando_aprovacao")
        .reduce((sum, f) => sum + Number(f.valor), 0);

    const pago = faturas
        .filter(f => f.status === "pago")
        .reduce((sum, f) => sum + Number(f.valor), 0);

    // Don't render if there's nothing to show
    if (faturas.length === 0) return null;

    const cards = [
        {
            label: "Em Aberto",
            value: pendente,
            icon: AlertCircle,
            iconColor: "text-red-500",
            bgColor: "bg-red-50/60",
            borderColor: "border-red-100",
            valueColor: pendente > 0 ? "text-red-600" : "text-gray-400",
            dotColor: "bg-red-500",
            show: true,
        },
        {
            label: "Em Análise",
            value: aguardando,
            icon: Clock,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-50/60",
            borderColor: "border-amber-100",
            valueColor: aguardando > 0 ? "text-amber-600" : "text-gray-400",
            dotColor: "bg-amber-400",
            show: aguardando > 0,
        },
        {
            label: "Pago no Ciclo",
            value: pago,
            icon: CheckCircle2,
            iconColor: "text-green-500",
            bgColor: "bg-green-50/60",
            borderColor: "border-green-100",
            valueColor: pago > 0 ? "text-green-600" : "text-gray-400",
            dotColor: "bg-green-500",
            show: pago > 0,
        },
    ].filter(c => c.show);

    if (cards.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={cn(
                        "flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md",
                        card.bgColor,
                        card.borderColor
                    )}
                >
                    <div className={cn("p-2.5 rounded-xl bg-white shadow-sm border", card.borderColor)}>
                        <card.icon size={18} className={card.iconColor} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
                        <span className={cn("text-xl font-black tracking-tight leading-none mt-0.5", card.valueColor)}>
                            {card.value > 0 ? format(card.value) : "—"}
                        </span>
                    </div>
                    {card.value > 0 && (
                        <div className={cn("w-1.5 h-1.5 rounded-full ml-auto shrink-0 animate-pulse", card.dotColor)} />
                    )}
                </div>
            ))}
        </div>
    );
}
