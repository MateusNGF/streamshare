"use client";

import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export function ProfitBadge({ amount }: { amount: number }) {
    if (amount <= 0) return null;
    const { format } = useCurrency();

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300 shrink-0">
            <TrendingUp size={10} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                Lucro: {format(amount)}/mês
            </span>
        </div>
    );
}
