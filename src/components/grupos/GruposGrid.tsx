"use client";

import { MessageCircle, Pencil, Trash2, Tv, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

// Types derived from usage in GruposClient
interface Grupo {
    id: number;
    nome: string;
    descricao: string | null;
    streamings: {
        streaming: {
            apelido: string | null;
            catalogo: {
                nome: string;
                corPrimaria?: string; // Opt
                iconeUrl?: string | null; // Opt
            };
        };
    }[];
    _count: {
        streamings: number;
    };
}

interface GruposGridProps {
    grupos: Grupo[];
    onRenovacao: (grupo: Grupo) => void;
    onEdit: (grupo: Grupo) => void;
    onDelete: (grupo: Grupo) => void;
}

export function GruposGrid({ grupos, onRenovacao, onEdit, onDelete }: GruposGridProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grupos.map((grupo, idx) => {
                // Aggregation logic
                const aggregated = grupo.streamings.reduce((acc, item) => {
                    const name = item.streaming.apelido || item.streaming.catalogo.nome;
                    acc.set(name, (acc.get(name) || 0) + 1);
                    return acc;
                }, new Map<string, number>());

                const displayItems = Array.from(aggregated.entries());
                const remainingCount = displayItems.length - 4;

                return (
                    <div
                        key={grupo.id}
                        className="group relative bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Header Gradient Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-accent/80" />

                        <div className="p-6 flex flex-col h-full">
                            {/* Title & Description */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                        {grupo.nome}
                                    </h3>
                                    {grupo.descricao ? (
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-[40px]">
                                            {grupo.descricao}
                                        </p>
                                    ) : (
                                        <div className="h-[40px] flex items-center">
                                            <span className="text-xs text-gray-300 italic">Sem descrição</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <Archive size={20} />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                    <Tv size={14} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-700">
                                        {grupo._count.streamings} <span className="font-normal text-gray-500">assinaturas</span>
                                    </span>
                                </div>
                            </div>

                            {/* Streamings List (Pills) */}
                            <div className="flex-1 mb-6">
                                <div className="flex flex-wrap gap-2 content-start">
                                    {displayItems.slice(0, 4).map(([name, count], i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 shadow-sm hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                                        >
                                            {name}
                                            {count > 1 && (
                                                <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold leading-none">
                                                    {count}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                    {remainingCount > 0 && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-400">
                                            +{remainingCount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                                <button
                                    onClick={() => onRenovacao(grupo)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm rounded-xl transition-colors group/btn"
                                >
                                    <MessageCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    <span>Cobrar</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(grupo)}
                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(grupo)}
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
