"use client";

import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface ProfitMicroBadgeProps {
    amount: number;
    showPlus?: boolean;
}

export function ProfitMicroBadge({ amount, showPlus = true }: ProfitMicroBadgeProps) {
    if (amount <= 0) return null;
    const { format } = useCurrency();

    return (
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded-md animate-in fade-in zoom-in duration-300">
            <TrendingUp size={8} className="shrink-0" />
            <span className="text-[8px] font-black leading-none">
                {showPlus && "+"}{format(amount)}
            </span>
        </div>
    );
}
