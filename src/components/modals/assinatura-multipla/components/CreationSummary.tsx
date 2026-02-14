"use client";

import { Wallet } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { FrequenciaPagamento } from "@prisma/client";
import { INTERVALOS_MESES, calcularTotalCiclo } from "@/lib/financeiro-utils";
import { StreamingOption, ParticipanteOption, SelectedStreaming } from "../types";

interface CreationSummaryProps {
    isOpen: boolean;
    onToggle: () => void;
    selectedStreamingIds: Set<number>;
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    selectedParticipanteIds: Set<number>;
    participantes: ParticipanteOption[];
    participanteVagasMap: Map<number, number>;
}

export function CreationSummary({
    isOpen,
    onToggle,
    selectedStreamingIds,
    selectedStreamings,
    configurations,
    selectedParticipanteIds,
    participantes,
    participanteVagasMap
}: CreationSummaryProps) {
    const { format } = useCurrency();

    if (selectedStreamingIds.size === 0) return null;

    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 transition-all shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-black text-gray-500 hover:bg-white transition-colors uppercase tracking-widest"
            >
                <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-primary" />
                    <span>Detalhes da Lote</span>
                </div>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] tracking-normal">
                    {isOpen ? 'Fechar' : 'Expandir'}
                </span>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-2">Serviços</p>
                            {selectedStreamings.map(s => {
                                const config = configurations.get(s.id);
                                const val = parseFloat(config?.valor || "0");
                                const mult = INTERVALOS_MESES[config?.frequencia as FrequenciaPagamento] || 1;

                                return (
                                    <div key={s.id} className="flex items-center justify-between text-[11px] pb-1.5 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-bold truncate max-w-[140px] leading-tight">{s.nome}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">{config?.frequencia}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-800 font-black block leading-none">{format(val)}/mês</span>
                                            {mult > 1 && (
                                                <span className="text-[9px] text-primary/60 font-bold block mt-0.5">
                                                    Ciclo: {format(calcularTotalCiclo(val, config?.frequencia as FrequenciaPagamento).toNumber())}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-2">Membros</p>
                            <div className="flex flex-wrap gap-1.5">
                                {Array.from(selectedParticipanteIds).slice(0, 10).map(id => {
                                    const p = participantes.find(part => part.id === id);
                                    if (!p) return null;
                                    const qty = participanteVagasMap.get(id) || 1;
                                    return (
                                        <span key={id} className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-[10px] text-gray-600 font-medium">
                                            {p.nome.split(' ')[0]}
                                            {qty > 1 && <span className="text-primary font-black ml-1">x{qty}</span>}
                                        </span>
                                    );
                                })}
                                {selectedParticipanteIds.size > 10 && (
                                    <span className="text-[10px] text-gray-400 self-center font-bold px-1">
                                        + {selectedParticipanteIds.size - 10} outros
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
