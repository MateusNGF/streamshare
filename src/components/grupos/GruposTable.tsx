"use client";

import { MessageCircle, Pencil, Trash2, Tv, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";

interface Grupo {
    id: number;
    nome: string;
    descricao: string | null;
    streamings: {
        streaming: {
            apelido: string | null;
            catalogo: {
                nome: string;
            };
        };
    }[];
    _count: {
        streamings: number;
    };
}

interface GruposTableProps {
    grupos: Grupo[];
    onRenovacao: (grupo: Grupo) => void;
    onEdit: (grupo: Grupo) => void;
    onDelete: (grupo: Grupo) => void;
}

export function GruposTable({ grupos, onRenovacao, onEdit, onDelete }: GruposTableProps) {
    if (grupos.length === 0) {
        return (
            <EmptyState
                icon={Tv}
                title="Nenhum grupo encontrado"
                description="Crie um grupo para começar a gerenciar suas assinaturas."
                variant="glass"
            />
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/30">
                        <TableRow className="hover:bg-transparent border-b border-gray-100/50">
                            <TableHead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 pl-6">
                                Grupo e Descrição
                            </TableHead>
                            <TableHead className="hidden sm:table-cell text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[100px]">
                                Vagas
                            </TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Serviços
                            </TableHead>
                            <TableHead className="w-[60px] text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-6">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grupos.map((grupo, idx) => {
                            const aggregated = grupo.streamings.reduce((acc, item) => {
                                const name = item.streaming.apelido || item.streaming.catalogo.nome;
                                acc.set(name, (acc.get(name) || 0) + 1);
                                return acc;
                            }, new Map<string, number>());

                            const displayItems = Array.from(aggregated.entries());
                            const remainingCount = displayItems.length - 4;

                            const menuOptions = [
                                {
                                    label: "Enviar Renovação",
                                    icon: <MessageCircle size={16} className="text-green-600" />,
                                    onClick: () => onRenovacao(grupo)
                                },
                                {
                                    label: "Editar Grupo",
                                    icon: <Pencil size={16} />,
                                    onClick: () => onEdit(grupo)
                                },
                                {
                                    type: "separator" as const
                                },
                                {
                                    label: "Excluir Grupo",
                                    icon: <Trash2 size={16} />,
                                    variant: "danger" as const,
                                    onClick: () => onDelete(grupo)
                                }
                            ];

                            return (
                                <TableRow
                                    key={grupo.id}
                                    className="group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                                                {grupo.nome}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {grupo.descricao ? (
                                                    <span className="text-[11px] text-gray-500 line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                                        {grupo.descricao}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">Sem descrição</span>
                                                )}
                                                {/* Badge de vagas visível apenas no mobile dentro da info do grupo */}
                                                <span className="sm:hidden inline-flex items-center px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-500">
                                                    {grupo._count.streamings} vagas
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-center">
                                        <div className="inline-flex items-center px-2 py-0.5 bg-gray-50/50 border border-gray-100/50 rounded-full">
                                            <span className="text-[11px] font-bold text-gray-600">{grupo._count.streamings}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                                            {displayItems.length > 0 ? (
                                                <>
                                                    {displayItems.slice(0, 3).map(([name, count], i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50/30 border border-gray-100/50 rounded-lg text-[10px] font-medium text-gray-500 whitespace-nowrap"
                                                        >
                                                            {name}
                                                            {count > 1 && (
                                                                <span className="flex items-center justify-center h-3.5 min-w-[14px] px-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold leading-none">
                                                                    {count}
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                    {displayItems.length > 3 && (
                                                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-gray-50/50 border border-gray-100 rounded-lg text-[9px] font-bold text-gray-400">
                                                            +{displayItems.length - 3}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">Nenhum serviço</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center pr-6">
                                        <Dropdown
                                            options={menuOptions}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
