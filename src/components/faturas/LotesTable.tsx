"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { User, Calendar, DollarSign, Eye, Clock, Hash, FileText } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell } from "@/components/cobrancas/shared/BillingTableCells";
import { formatCurrency } from "@/lib/formatCurrency";

interface LotesTableProps {
    lotes: any[];
    onViewDetails: (id: number) => void;
}

export function LotesTable({
    lotes,
    onViewDetails,
}: LotesTableProps) {
    if (lotes.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <EmptyState
                    icon={FileText}
                    title="Nenhum lote encontrado"
                    description="Histórico de pagamentos consolidados aparecerá aqui."
                    className="bg-transparent border-none py-12"
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[100px]">
                                <div className="flex items-center gap-2">
                                    <Hash size={12} className="text-gray-400" />
                                    Lote ID
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Criado em
                                </div>
                            </TableHead>

                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider px-4">
                                <div className="flex items-center gap-2">
                                    <User size={12} className="text-gray-400" />
                                    Participante
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-2">
                                    <Hash size={12} className="text-gray-400" />
                                    Qtd. Itens
                                </div>
                            </TableHead>

                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor Total
                                </div>
                            </TableHead>

                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lotes.map((lote: any, index: number) => {
                            return (
                                <TableRow
                                    key={lote.id}
                                    className="group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <TableCell>
                                        <span className="font-bold text-gray-900 leading-tight">
                                            #{lote.id}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center text-sm text-gray-600">
                                        {new Date(lote.createdAt).toLocaleDateString('pt-BR')}
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                                {lote.participante?.nome?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                                {lote.participante?.nome || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <StatusBadge status={lote.status} className="scale-75" />
                                    </TableCell>

                                    <TableCell className="text-center text-sm font-medium text-gray-700">
                                        {lote.cobrancas.length} faturas
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-right">
                                        <span className="font-black text-gray-900">
                                            {formatCurrency(Number(lote.valorTotal), lote.moeda || 'BRL')}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <button
                                            onClick={() => onViewDetails(lote.id)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                                        >
                                            <Eye size={18} />
                                        </button>
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
