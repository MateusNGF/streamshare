"use client";

import { useMemo } from "react";
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
    capacityInfo
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
        <div className="space-y-4 h-[60vh] md:h-[460px] flex flex-col">
            <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">Selecione os Participantes</h3>
                <p className="text-xs text-gray-500 mt-2">
                    Escolha quem fará parte destas assinaturas. O sistema respeita automaticamente a disponibilidade dos streamings.
                </p>
            </div>

            <div className="flex flex-col flex-1 p-3 gap-3 bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden shadow-inner">
                {/* Toolbar */}
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou WhatsApp..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-lg ${selectedIds.size > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {totalVagas} {totalVagas === 1 ? 'vaga' : 'vagas'} {totalVagas === 1 ? 'selecionada' : 'selecionadas'}
                        </span>
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className={`p-1.5 rounded-lg border transition-all ${isAllFilteredSelected ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
                            title={isAllFilteredSelected ? "Desmarcar Filtrados" : "Selecionar Filtrados"}
                        >
                            <Check size={16} />
                        </button>
                    </div>
                </div>

                {/* Capacity Counter/Warning */}
                {capacityInfo.showWarning && (
                    <div className={`text-xs px-3 py-2.5 rounded-xl border flex items-start gap-2 animate-in slide-in-from-top-1 ${capacityInfo.isOverloaded
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                        }`}>
                        <div className="mt-0.5 shrink-0">
                            {capacityInfo.isOverloaded ? <X size={14} /> : <Users size={14} />}
                        </div>
                        <div className="flex-1 leading-tight">
                            <span className="font-black uppercase tracking-tighter mr-1.5">
                                {capacityInfo.isOverloaded ? "Limite Excedido" : "Capacidade Restante:"}
                            </span>
                            <span className="font-medium">
                                {capacityInfo.isOverloaded
                                    ? `Existem mais participantes do que vagas em alguns serviços selecionados.`
                                    : capacityInfo.minSlots === 0
                                        ? "Não há mais vagas disponíveis nos streamings selecionados."
                                        : `Você ainda pode adicionar até ${capacityInfo.minSlots} ${capacityInfo.minSlots === 1 ? 'vaga' : 'vagas'}.`}
                            </span>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filtered.map(p => (
                        <ParticipantSelectionItem
                            key={p.id}
                            p={p}
                            isSelected={selectedIds.has(p.id)}
                            qty={quantities.get(p.id) || 1}
                            onToggle={onToggle}
                            onQuantityChange={onQuantityChange}
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
