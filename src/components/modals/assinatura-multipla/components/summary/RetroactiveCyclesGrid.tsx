"use client";

import { History, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { format as formatDate } from "date-fns";

interface RetroactiveCycle {
    periodoInicio: Date;
    periodoFim: Date;
    dataVencimento: Date;
    valor: number;
}

interface RetroactiveCyclesGridProps {
    ciclos: RetroactiveCycle[];
    paidIndices: number[];
    onToggle: (index: number) => void;
    formatCurrency: (val: number) => string;
}

export function RetroactiveCyclesGrid({
    ciclos,
    paidIndices,
    onToggle,
    formatCurrency
}: RetroactiveCyclesGridProps) {
    if (ciclos.length === 0) return null;

    return (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
                <SectionHeader
                    title="Ciclos Retroativos"
                    description="Identificamos períodos anteriores à data de hoje. Selecione os que já foram pagos."
                />
                <Tooltip content="Meses anteriores à data de hoje que ainda não foram lançados no sistema. Marque os que o usuário já quitou.">
                    <div className="p-1 bg-gray-50 rounded-lg text-gray-300 hover:text-primary cursor-help transition-colors">
                        <Info size={14} />
                    </div>
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ciclos.map((ciclo, idx) => {
                    const isPaid = paidIndices.includes(idx);
                    return (
                        <div
                            key={idx}
                            onClick={() => onToggle(idx)}
                            className={cn(
                                "group relative p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                isPaid
                                    ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5"
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                    isPaid ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                                )}>
                                    <History size={16} />
                                </div>
                                {isPaid && <Badge className="bg-primary text-[8px] h-4 font-black">PAGO</Badge>}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Período</span>
                                <span className="text-[12px] font-black text-gray-800">
                                    {formatDate(ciclo.periodoInicio, "dd/MM")} - {formatDate(ciclo.periodoFim, "dd/MM/yy")}
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[11px] font-black text-primary">{formatCurrency(ciclo.valor)}</span>
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                    isPaid ? "bg-primary border-primary" : "border-gray-200 bg-white"
                                )}>
                                    {isPaid && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
