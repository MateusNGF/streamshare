"use client";

import { MessageCircle, Pencil, Trash2, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
                        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-smooth flex flex-col overflow-hidden animate-fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="p-6 flex flex-col h-full">
                            {/* Title & Description */}
                            <div className="flex justify-between items-start mb-5">
                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                        {grupo.nome}
                                    </h3>
                                    {grupo.descricao ? (
                                        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed h-[40px]">
                                            {grupo.descricao}
                                        </p>
                                    ) : (
                                        <div className="h-[40px] flex items-center">
                                            <span className="text-[11px] text-gray-400 italic">Sem descrição</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-gray-50/50 rounded-xl text-primary transition-colors">
                                    <Tv size={18} />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50/50 rounded-full border border-gray-100">
                                    <span className="text-[11px] font-bold text-gray-700">
                                        {grupo._count.streamings} <span className="font-normal text-gray-400">serviços</span>
                                    </span>
                                </div>
                            </div>

                            {/* Streamings List (Pills) */}
                            <div className="flex-1 mb-6">
                                <div className="flex flex-wrap gap-1.5 content-start">
                                    {displayItems.slice(0, 4).map(([name, count], i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50/30 border border-gray-100/50 rounded-lg text-[10px] font-medium text-gray-500 transition-colors"
                                        >
                                            {name}
                                            {count > 1 && (
                                                <span className="flex items-center justify-center h-3.5 min-w-[14px] px-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                                                    {count}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                    {remainingCount > 0 && (
                                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-gray-50/50 border border-gray-100 rounded-lg text-[9px] font-bold text-gray-400">
                                            +{remainingCount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3 mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRenovacao(grupo)}
                                    className="flex-1"
                                >
                                    <MessageCircle size={14} className="mr-2" />
                                    Renovar
                                </Button>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(grupo)}
                                        title="Editar"
                                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50/50"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(grupo)}
                                        title="Excluir"
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50/50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
