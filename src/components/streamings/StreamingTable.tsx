"use client";

import { Search, MoreHorizontal, Pencil, Trash2, Users, ExternalLink, Globe } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

interface StreamingTableProps {
    streamings: any[];
    isLoading: boolean;
    searchTerm: string;
    onEdit: (streaming: any) => void;
    onDelete: (streaming: any) => void;
}

export function StreamingTable({ streamings, isLoading, searchTerm, onEdit, onDelete }: StreamingTableProps) {
    const toast = useToast();

    const handleCopyLink = (token: string) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copiado para a área de transferência!");
    };

    if (isLoading && streamings.length === 0) {
        return (
            <div className="text-center py-12 md:py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-4">Carregando streamings...</p>
            </div>
        );
    }

    if (streamings.length === 0) {
        return (
            <EmptyState
                icon={Search}
                title="Nenhum serviço encontrado"
                description={searchTerm
                    ? "Não encontramos nenhum serviço com o termo pesquisado."
                    : "Você ainda não cadastrou nenhum serviço de streaming."}
            />
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider py-5 px-6">
                                Serviço
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Ocupação
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Valor
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Visibilidade
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {streamings
                            .filter((s) => s.catalogo)
                            .map((s, idx) => {
                                const occupied = s._count?.assinaturas || 0;
                                const total = s.limiteParticipantes;
                                const percentage = Math.round((occupied / total) * 100);
                                const isFull = occupied >= total;

                                const menuOptions = [
                                    {
                                        label: "Editar",
                                        icon: <Pencil size={16} />,
                                        onClick: () => onEdit(s)
                                    },
                                    ...(s.isPublico && s.publicToken ? [{
                                        label: "Copiar Link",
                                        icon: <ExternalLink size={16} />,
                                        onClick: () => handleCopyLink(s.publicToken)
                                    }] : []),
                                    {
                                        label: "Excluir",
                                        icon: <Trash2 size={16} />,
                                        className: "text-red-600",
                                        onClick: () => onDelete(s)
                                    }
                                ];

                                return (
                                    <TableRow
                                        key={s.id}
                                        className="group animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both hover:bg-gray-50/50"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <StreamingLogo
                                                    name={s.apelido || s.catalogo.nome}
                                                    iconeUrl={s.catalogo.iconeUrl}
                                                    color={s.catalogo.corPrimaria}
                                                    size="sm"
                                                    rounded="xl"
                                                    className="shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {s.apelido || s.catalogo.nome}
                                                    </span>
                                                    {s.apelido && (
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                            {s.catalogo.nome}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                                    <Users size={14} className="text-gray-400" />
                                                    {occupied} / {total}
                                                </div>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            isFull ? "bg-red-500" : "bg-green-500"
                                                        )}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-gray-900">
                                                    {formatarMoeda(s.valorIntegral)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Mensal</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {s.isPublico ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                                    <Globe size={12} />
                                                    Público
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                                                    Privado
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Dropdown
                                                options={menuOptions}
                                                trigger={
                                                    <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
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
