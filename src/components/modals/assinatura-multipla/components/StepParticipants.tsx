"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, Users, X } from "lucide-react";
import { ParticipanteOption } from "../types";
import { ParticipantSelectionItem } from "./ParticipantSelectionItem";

interface StepParticipantsProps {
    participantes: ParticipanteOption[];
    selectedIds: Set<number>;
    quantities: Map<number, number>;
    onToggle: (id: number) => void;
    onQuantityChange: (id: number, delta: number) => void;
    onSelectAll: () => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    capacityInfo: { isOverloaded: boolean; minSlots: number; showWarning: boolean };
    preSelectedId?: string;
}

export function StepParticipants({
    participantes,
    selectedIds,
    quantities,
    onToggle,
    onQuantityChange,
    onSelectAll,
    searchTerm,
    onSearchChange,
    capacityInfo,
    preSelectedId
}: StepParticipantsProps) {
    const filtered = useMemo(() => {
        if (!searchTerm) return participantes;
        return participantes.filter(p =>
            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.whatsappNumero.includes(searchTerm)
        );
    }, [participantes, searchTerm]);

    const isAllFilteredSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));

    const totalVagas = useMemo(() => Array.from(quantities.values()).reduce((acc, qty) => acc + qty, 0), [quantities]);


    return (
        <div className="space-y-4 flex flex-col">
            <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">Selecione os Participantes</h3>
                <p className="text-xs text-gray-500 mt-2">
                    Escolha quem fará parte destas assinaturas. O sistema respeita automaticamente a disponibilidade dos streamings.
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
                    <div className="flex items-center gap-2 shrink-0 pr-1">
                        <span className={cn(
                            "text-[10px] uppercase font-extrabold tracking-wider px-3 py-2 rounded-xl tabular-nums shadow-sm transition-all duration-300",
                            selectedIds.size > 0 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100'
                        )}>
                            {totalVagas} {totalVagas === 1 ? 'vaga' : 'vagas'}
                        </span>
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className={cn(
                                "p-2.5 rounded-xl border transition-all active:scale-90",
                                isAllFilteredSelected
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary shadow-sm'
                            )}
                            title={isAllFilteredSelected ? "Desmarcar Filtrados" : "Selecionar Filtrados"}
                        >
                            <Check size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Capacity Counter/Warning */}
                {capacityInfo.showWarning && (() => {
                    const { isOverloaded, minSlots } = capacityInfo;

                    let config = {
                        classes: "bg-white border-blue-100 text-blue-700 shadow-sm",
                        icon: <Users size={14} className="text-blue-500" />,
                        title: "Disponibilidade:",
                        message: `Espaço para mais ${minSlots} ${minSlots === 1 ? 'vaga' : 'vagas'}.`
                    };

                    if (isOverloaded) {
                        config = {
                            classes: "bg-red-50/50 border-red-200 text-red-700 animate-pulse",
                            icon: <X size={14} className="text-red-500" />,
                            title: "Overbooking:",
                            message: "Reduza a quantidade de vagas para prosseguir."
                        };
                    } else if (minSlots === 0) {
                        config = {
                            classes: "bg-amber-50/50 border-amber-100 text-amber-700",
                            icon: <Users size={14} className="text-amber-500" />,
                            title: "Limite Atingido:",
                            message: "Todas as vagas disponíveis foram preenchidas."
                        };
                    }

                    return (
                        <div className={cn(
                            "text-[11px] px-4 py-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-1 transition-all duration-500",
                            config.classes
                        )}>
                            <div className="shrink-0 p-1.5 bg-white rounded-lg shadow-sm">{config.icon}</div>
                            <div className="flex-1 leading-tight">
                                <span className="font-extrabold uppercase tracking-tight mr-2">{config.title}</span>
                                <span className="font-bold opacity-80">{config.message}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* List */}
                <div className="flex-1 space-y-1.5 pr-1">
                    {filtered.map(p => (
                        <ParticipantSelectionItem
                            key={p.id}
                            p={p}
                            isSelected={selectedIds.has(p.id)}
                            qty={quantities.get(p.id) || 1}
                            onToggle={onToggle}
                            onQuantityChange={onQuantityChange}
                            canAddMore={capacityInfo.minSlots > 0}
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
