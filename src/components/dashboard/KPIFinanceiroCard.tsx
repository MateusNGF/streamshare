'use client';

import { LucideIcon } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface KPIFinanceiroCardProps {
    titulo: string;
    valor: number;
    icone: LucideIcon;
    cor: "primary" | "green" | "red";
}

const corConfig: Record<"primary" | "green" | "red", string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600"
};

export function KPIFinanceiroCard({ titulo, valor, icone: Icon, cor }: KPIFinanceiroCardProps) {
    const { format } = useCurrency();

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className={`inline-flex p-3 rounded-2xl ${corConfig[cor]} mb-4 transition-transform hover:scale-110 duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
                {format(valor)}
            </div>
            <div className="text-gray-500 text-sm">{titulo}</div>
        </div>
    );
}
