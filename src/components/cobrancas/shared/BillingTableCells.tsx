"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { format as formatFN } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";
import { differenceInDays, startOfDay, isToday } from "date-fns";

/**
 * 1. Célula de Valor (Ciclo + Mensal)
 * Otimizada para evitar quebras de linha e garantir legibilidade em telas pequenas
 */
export function BillingValueCell({ valor, valorMensal, className }: { valor: number | string, valorMensal?: number | string, className?: string }) {
    const { format } = useCurrency();
    return (
        <div className={cn("flex flex-col items-end gap-0.5 min-w-[80px]", className)}>
            <span className="font-extrabold text-gray-900 text-[13px] sm:text-sm leading-tight whitespace-nowrap">
                {format(Number(valor))}
            </span>
            {valorMensal && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold whitespace-nowrap uppercase tracking-tighter">
                    {format(Number(valorMensal))} / mês
                </span>
            )}
        </div>
    );
}

/**
 * 2. Célula de Período (MMM/yy | MMM/yy)
 * Design de pílula compacta com melhor espaçamento
 */
export function BillingPeriodCell({ inicio, fim, className }: { inicio: Date | string, fim: Date | string, className?: string }) {
    if (!inicio || !fim) return <span className="text-[10px] text-gray-300 italic">N/A</span>;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-gray-700 uppercase whitespace-nowrap",
            "bg-gray-50/80 px-2.5 py-1 rounded-md border border-gray-100/80 shadow-sm sm:shadow-none",
            className
        )}>
            <span>{formatFN(new Date(inicio), 'MMM/yy', { locale: ptBR })}</span>
            <span className="text-gray-300 font-normal">|</span>
            <span>{formatFN(new Date(fim), 'MMM/yy', { locale: ptBR })}</span>
        </div>
    );
}

/**
 * 3. Célula de Vencimento (Data + Contador)
 * Exibição inteligente de prazos com cores de alerta
 */
export function BillingDueDateCell({ data, status, className }: { data: Date | string, status: string, className?: string }) {
    const dueDate = new Date(data);
    const today = startOfDay(new Date());
    const dueDay = startOfDay(dueDate);
    const atrasada = (status === 'pendente' || status === "atrasado") && new Date() > dueDate;
    const dias = differenceInDays(dueDay, today);

    return (
        <div className={cn("flex flex-col items-center gap-0.5 min-w-[70px]", className)}>
            <span className={cn(
                "text-[11px] sm:text-xs font-bold whitespace-nowrap",
                atrasada ? "text-red-600" : "text-gray-700"
            )}>
                {dueDate.toLocaleDateString('pt-BR')}
            </span>

            {atrasada && (
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-red-500 font-black uppercase tracking-tighter leading-none">
                    <Clock size={8} className="animate-pulse" />
                    ATRASADA
                </div>
            )}

            {!atrasada && (status === 'pendente' || status === 'vencendo') && (
                <>
                    {isToday(dueDate) ? (
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-orange-500 font-black uppercase tracking-tighter leading-none">
                            <Clock size={8} />
                            HOJE
                        </div>
                    ) : (
                        dias > 0 && dias <= 7 && (
                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-blue-500 font-black uppercase tracking-tighter leading-none">
                                <Clock size={8} />
                                {dias} DIAS
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
