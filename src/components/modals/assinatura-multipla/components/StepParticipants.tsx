"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, Users, X } from "lucide-react";
import { ParticipanteOption } from "../types";
import { ParticipantSelectionItem } from "./ParticipantSelectionItem";
import { useDebounce } from "@/hooks/useDebounce";

import { StreamingOption } from "../types";

interface StepParticipantsProps {
    participantes: ParticipanteOption[];
    selectedIds: Set<number>;
    selectedStreamings: StreamingOption[];
    participantStreamings: Map<number, Set<number>>;
    onToggleStreaming: (participantId: number, streamingId: number) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    capacityInfo: { isOverloaded: boolean; showWarning: boolean };
    preSelectedId?: string;
}

export function StepParticipants({
    participantes,
    selectedIds,
    selectedStreamings,
    participantStreamings,
    onToggleStreaming,
    searchTerm,
    onSearchChange,
    capacityInfo,
    preSelectedId
}: StepParticipantsProps) {
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filtered = useMemo(() => {
        if (!debouncedSearchTerm) return participantes;
        return participantes.filter(p =>
            p.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            p.whatsappNumero.includes(debouncedSearchTerm)
        );
    }, [participantes, debouncedSearchTerm]);

    const totalVagas = useMemo(() => {
        let sum = 0;
        participantStreamings.forEach(subs => sum += subs.size);
        return sum;
    }, [participantStreamings]);


    return (
        <div className="space-y-4 flex flex-col">
            <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">Selecione os Participantes</h3>
                <p className="text-xs text-gray-500 mt-2">
                    Escolha quais serviços cada participante assinará, marcando na lista abaixo.
                </p>
            </div>

            <div className={`flex flex-col flex-1 p-3 gap-3 bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden shadow-inner`}>
                {/* Toolbar */}
                <div className="flex gap-2 items-center bg-white/40 p-1 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400/80" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou WhatsApp..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-100/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all bg-white shadow-sm font-medium"
                        />
                    </div>
                    <span className={cn(
                        "text-[10px] uppercase font-extrabold tracking-wider px-3 py-2 rounded-xl tabular-nums shadow-sm transition-all duration-300",
                        totalVagas > 0 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100'
                    )}>
                        {totalVagas} {totalVagas === 1 ? 'assinatura' : 'assinaturas'}
                    </span>
                </div>

                {/* Capacity Counter/Warning */}
                {capacityInfo.showWarning && (() => {
                    const { isOverloaded } = capacityInfo;

                    if (isOverloaded) {
                        return (
                            <div className="text-[11px] px-4 py-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-1 transition-all duration-500 bg-red-50/50 border-red-200 text-red-700 animate-pulse">
                                <div className="shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
                                    <X size={14} className="text-red-500" />
                                </div>
                                <div className="flex-1 leading-tight">
                                    <span className="font-extrabold uppercase tracking-tight mr-2">Overbooking:</span>
                                    <span className="font-bold opacity-80">Reduza a quantidade de vagas para prosseguir.</span>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* List */}
                <div className="flex-1 space-y-2 pr-1 overflow-y-auto max-h-[500px]">
                    {filtered.map(p => (
                        <ParticipantSelectionItem
                            key={p.id}
                            p={p}
                            selectedStreamings={selectedStreamings}
                            participantStreamings={participantStreamings}
                            onToggleStreaming={onToggleStreaming}
                        />
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-12 flex flex-col items-center gap-2 text-gray-400">
                            <Users size={32} className="opacity-20 mb-1" />
                            <p className="text-sm font-bold">Nenhum participante encontrado</p>
                            <p className="text-xs">Tente outro nome ou limpe a busca.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
