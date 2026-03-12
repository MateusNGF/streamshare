"use client";

import { useState, useMemo } from "react";
import { History, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { format as formatDate } from "date-fns";

interface RetroactiveCycle {
    tipo: string;
    periodo: string;
    vencimento: string;
    valor: number;
    streamingId: number;
    cor: string;
    iconeUrl?: string | null;
    index: number;
    streaming: string;
}

interface RetroactiveCyclesGridProps {
    ciclos: RetroactiveCycle[];
    paidPeriods: Array<{ streamingId: number; index: number }>;
    onToggle: (cycle: RetroactiveCycle) => void;
    formatCurrency: (val: number) => string;
}

export function RetroactiveCyclesGrid({
    ciclos,
    paidPeriods,
    onToggle,
    formatCurrency
}: RetroactiveCyclesGridProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Helper to update URL

    const groupedCiclos = useMemo(() => {
        const groups = new Map<number, {
            streamingId: number;
            streaming: string;
            cor: string;
            iconeUrl?: string | null;
            cycles: RetroactiveCycle[]
        }>();

        ciclos.forEach(c => {
            if (!groups.has(c.streamingId)) {
                groups.set(c.streamingId, {
                    streamingId: c.streamingId,
                    streaming: c.streaming,
                    cor: c.cor,
                    iconeUrl: c.iconeUrl,
                    cycles: []
                });
            }
            groups.get(c.streamingId)!.cycles.push(c);
        });

        return Array.from(groups.values());
    }, [ciclos]);

    if (ciclos.length === 0) return null;

    return (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <SectionHeader
                title="Ajustes do Passado (Retroativos)"
                description="Identificamos meses anteriores ao início do uso. Selecione o que já foi pago."
                rightElement={
                    <div className="flex items-center gap-2">
                        <Tooltip content="Meses anteriores à data de hoje que ainda não foram lançados no sistema. Marque os que o participante já quitou.">
                            <div className="p-2 bg-gray-50 rounded-xl text-gray-300 hover:text-primary cursor-help transition-colors border border-gray-100">
                                <Info size={14} />
                            </div>
                        </Tooltip>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] sm:text-[11px] font-black transition-all border border-gray-100 shrink-0"
                        >
                            {isCollapsed ? (
                                <>
                                    <span className="hidden sm:inline">Mostrar Ajustes</span>
                                    <span className="sm:hidden">Expandir</span>
                                    <ChevronDown size={14} />
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">Ocultar Ajustes</span>
                                    <span className="sm:hidden">Recolher</span>
                                    <ChevronUp size={14} />
                                </>
                            )}
                        </button>
                    </div>
                }
            />

            <div className="space-y-4">
                {groupedCiclos.map((group) => (
                    <div key={group.streamingId} className="space-y-3">
                        <div className="flex items-center gap-3 px-1">
                            <StreamingLogo
                                name={group.streaming}
                                color={group.cor}
                                iconeUrl={group.iconeUrl}
                                size="xs"
                                rounded="lg"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-black text-gray-800 tracking-tight">{group.streaming}</span>
                                <Badge className="bg-gray-100 text-gray-400 text-[9px] h-4 font-black px-1.5 border-0">
                                    {group.cycles.length} {group.cycles.length === 1 ? 'Ciclo' : 'Ciclos'}
                                </Badge>
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.cycles.map((ciclo) => {
                                    const isPaid = paidPeriods.some(p => p.streamingId === ciclo.streamingId && p.index === ciclo.index);
                                    return (
                                        <div
                                            key={`${ciclo.streamingId}-${ciclo.index}`}
                                            onClick={() => onToggle(ciclo)}
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
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                                    Período
                                                </span>
                                                <span className="text-[12px] font-black text-gray-800">
                                                    {ciclo.periodo}
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
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
