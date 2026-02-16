"use client";

import { MessageCircle, Pencil, Trash2, Tv, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dropdown } from "@/components/ui/Dropdown";

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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <Tv className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Nenhum grupo encontrado</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        Crie um grupo para começar a gerenciar suas assinaturas.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[250px] py-4 pl-6">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={14} className="text-gray-400" />
                                    Grupo e Descrição
                                </div>
                            </TableHead>
                            <TableHead className="text-center  text-xs font-bold text-gray-500 uppercase tracking-wider w-[140px]">
                                <div className="flex items-center justify-center w-[200px] gap-2">
                                    <Tv size={14} className="text-gray-400" />
                                    Vagas Ocupadas
                                </div>
                            </TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-gray-400" />
                                    Serviços
                                </div>
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-xs font-bold text-gray-500 uppercase tracking-wider pr-6">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grupos.map((grupo, idx) => {
                            // Aggregation logic
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
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{grupo.nome}</span>
                                            {grupo.descricao ? (
                                                <span className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-[250px]">{grupo.descricao}</span>
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic mt-0.5">Sem descrição</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full group-hover:bg-white transition-colors">
                                            <Tv size={12} className="text-gray-400" />
                                            <span className="text-xs font-bold text-gray-700">{grupo._count.streamings}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {displayItems.length > 0 ? (
                                                <>
                                                    {displayItems.slice(0, 4).map(([name, count], i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 whitespace-nowrap shadow-sm"
                                                        >
                                                            {name}
                                                            {count > 1 && (
                                                                <span className="flex items-center justify-center h-3.5 min-w-[14px] px-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold leading-none">
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
                                                </>
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic">Nenhum serviço vinculado</span>
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
