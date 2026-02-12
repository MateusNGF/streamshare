"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { format as formatFN } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";
import { differenceInDays, startOfDay, isToday } from "date-fns";

// 1. Célula de Valor (Ciclo + Mensal)
export function BillingValueCell({ valor, valorMensal, className }: { valor: number | string, valorMensal?: number | string, className?: string }) {
    const { format } = useCurrency();
    return (
        <div className={cn("flex flex-col items-end", className)}>
            <span className="font-black text-gray-900 text-sm leading-tight">
                {format(Number(valor))}
            </span>
            {valorMensal && (
                <span className="text-[10px] text-gray-400 font-medium">
                    {format(Number(valorMensal))} / mês
                </span>
            )}
        </div>
    );
}

// 2. Célula de Período (MMM/yy | MMM/yy)
export function BillingPeriodCell({ inicio, fim, className }: { inicio: Date | string, fim: Date | string, className?: string }) {
    return (
        <div className={cn("inline-flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100", className)}>
            <span>{formatFN(new Date(inicio), 'MMM/yy', { locale: ptBR })}</span>
            <span className="text-gray-300">|</span>
            <span>{formatFN(new Date(fim), 'MMM/yy', { locale: ptBR })}</span>
        </div>
    );
}

// 3. Célula de Vencimento (Data + Contador)
export function BillingDueDateCell({ data, status, className }: { data: Date | string, status: string, className?: string }) {
    const dueDate = new Date(data);
    const today = startOfDay(new Date());
    const dueDay = startOfDay(dueDate);
    const atrasada = (status === 'pendente' || status === "atrasado") && new Date() > dueDate;
    const dias = differenceInDays(dueDay, today);

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <span className={cn(
                "text-xs font-medium",
                atrasada ? "text-red-600 font-bold" : "text-gray-700"
            )}>
                {dueDate.toLocaleDateString('pt-BR')}
            </span>
            {atrasada && (
                <div className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                    <Clock size={8} />
                    ATRASADA
                </div>
            )}
            {!atrasada && (status === 'pendente' || status === 'vencendo') && (
                <>
                    {isToday(dueDate) ? (
                        <div className="flex items-center gap-1 text-[9px] text-orange-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                            <Clock size={8} />
                            VENCE HOJE
                        </div>
                    ) : (
                        dias > 0 && dias <= 7 && (
                            <div className="flex items-center gap-1 text-[9px] text-blue-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                                <Clock size={8} />
                                FALTAM {dias} DIAS
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
