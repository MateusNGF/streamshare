"use client";

import { MessageCircle, Pencil, Trash2, Tv, MoreHorizontal } from "lucide-react";
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
    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-wider py-5 px-8 w-[25%]">
                                Grupo
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider w-[15%]">
                                Assinaturas
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                Serviços
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-[10px] font-black text-gray-400 uppercase tracking-wider pr-8">Ações</TableHead>
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
                                    label: "Excluir Grupo",
                                    icon: <Trash2 size={16} />,
                                    className: "text-red-600 hover:bg-red-50",
                                    onClick: () => onDelete(grupo)
                                }
                            ];

                            return (
                                <TableRow
                                    key={grupo.id}
                                    className="group animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="py-5 px-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{grupo.nome}</span>
                                            {grupo.descricao && (
                                                <span className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{grupo.descricao}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                            <Tv size={14} className="text-gray-400" />
                                            <span className="text-xs font-bold text-gray-700">{grupo._count.streamings}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {displayItems.slice(0, 4).map(([name, count], i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600 whitespace-nowrap"
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
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center pr-8">
                                        <Dropdown
                                            options={menuOptions}
                                            trigger={
                                                <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
                                                    <MoreHorizontal size={18} />
                                                </div>
                                            }
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
