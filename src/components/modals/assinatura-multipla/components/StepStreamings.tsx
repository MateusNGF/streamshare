"use client";

import { useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { Search, Check } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StreamingOption } from "../types";
import { useDebounce } from "@/hooks/useDebounce";
import { Tooltip } from "@/components/ui/Tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface StepStreamingsProps {
    streamings: StreamingOption[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onNext?: () => void;
}

export function StepStreamings({
    streamings,
    selectedIds,
    onToggle,
    searchTerm,
    onSearchChange,
    onNext
}: StepStreamingsProps) {
    const { format } = useCurrency();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filtered = useMemo(() => {
        if (!debouncedSearchTerm) return streamings;
        return streamings.filter(s => s.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }, [streamings, debouncedSearchTerm]);

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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filtered.map(streaming => {
                    const isSelected = selectedIds.has(streaming.id);
                    const isFull = streaming.ocupados >= streaming.limiteParticipantes;

                    const card = (
                        <button
                            key={streaming.id}
                            type="button"
                            onClick={() => {
                                if (isFull) return;
                                onToggle(streaming.id);
                            }}
                            disabled={isFull}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left group w-full h-full flex flex-col items-start justify-between ${isSelected
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
                            <div className="flex-1">
                                <StreamingLogo
                                    name={streaming.nome}
                                    color={streaming.cor}
                                    iconeUrl={streaming.iconeUrl}
                                    size="lg"
                                    rounded="2xl"
                                    className="shadow-sm group-hover:scale-110 transition-transform mb-3"
                                />
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{streaming.nome}</h4>
                                <p className="text-xs text-gray-500">
                                    {streaming.ocupados}/{streaming.limiteParticipantes} vagas
                                    {isFull && " • LOTADO"}
                                </p>
                            </div>
                            <p className="text-xs font-bold text-primary mt-3 shrink-0">
                                {format(streaming.valorIntegral)}
                            </p>
                        </button>
                    );

                    if (isFull) {
                        return (
                            <TooltipPrimitive.Provider key={streaming.id}>
                                <Tooltip content={`Este grupo já atingiu o limite máximo de ${streaming.limiteParticipantes} vagas.`} position="top">
                                    {card}
                                </Tooltip>
                            </TooltipPrimitive.Provider>
                        );
                    }

                    return card;
                })}
            </div>
        </div>
    );
}
