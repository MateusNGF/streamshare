"use client";

import { useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { Search, Check } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StreamingOption } from "../types";

interface StepStreamingsProps {
    streamings: StreamingOption[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
}

export function StepStreamings({
    streamings,
    selectedIds,
    onToggle,
    searchTerm,
    onSearchChange
}: StepStreamingsProps) {
    const { format } = useCurrency();

    const filtered = useMemo(() => {
        if (!searchTerm) return streamings;
        return streamings.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [streamings, searchTerm]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Selecione os Streamings</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Escolha os serviços de streaming que deseja adicionar
                    {selectedIds.size > 0 && (
                        <span className="ml-2 text-primary font-bold">
                            ({selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''})
                        </span>
                    )}
                </p>
            </div>

            {streamings.length > 4 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar streaming..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filtered.map(streaming => {
                    const isSelected = selectedIds.has(streaming.id);
                    const isFull = streaming.ocupados >= streaming.limiteParticipantes;

                    return (
                        <button
                            key={streaming.id}
                            type="button"
                            onClick={() => !isFull && onToggle(streaming.id)}
                            disabled={isFull}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left group ${isSelected
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                } ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                            <StreamingLogo
                                name={streaming.nome}
                                color={streaming.cor}
                                iconeUrl={streaming.iconeUrl}
                                size="lg"
                                className="shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <h4 className="font-bold text-gray-900 text-sm mb-1 mt-2">{streaming.nome}</h4>
                            <p className="text-xs text-gray-500">
                                {streaming.ocupados}/{streaming.limiteParticipantes} vagas
                                {isFull && " • LOTADO"}
                            </p>
                            <p className="text-xs font-bold text-primary mt-1">
                                {format(streaming.valorIntegral)}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
