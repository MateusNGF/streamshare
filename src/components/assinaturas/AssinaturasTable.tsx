"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User, Activity, TrendingUp, History as HistoryIcon, CreditCard, Eye, Trash } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { Tooltip } from "@/components/ui/Tooltip";
import { format as formatFN } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCurrency } from "@/hooks/useCurrency";
import { calcularTotalCiclo } from "@/lib/financeiro-utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

interface AssinaturasTableProps {
    subscriptions: any[];
    onViewDetails: (sub: any) => void;
    onCancel: (sub: any) => void;
}

export function AssinaturasTable({ subscriptions, onViewDetails, onCancel }: AssinaturasTableProps) {
    const { format } = useCurrency();

    if (subscriptions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <EmptyState
                    title="Nenhuma assinatura encontrada"
                    description="Tente ajustar os filtros ou crie uma nova assinatura."
                    icon={Search}
                    className="bg-transparent border-none"
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
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <User size={12} className="text-gray-400" />
                                    Participante
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Activity size={12} className="text-gray-400" />
                                    Serviço
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUp size={12} className="text-gray-400" />
                                    Frequência
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <HistoryIcon size={12} className="text-gray-400" />
                                    Vigência (Período)
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-end gap-2">
                                    <CreditCard size={12} className="text-gray-400" />
                                    Valores
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map((sub, index) => {
                            const isCancelled = sub.status === 'cancelada';
                            const isNonMonthly = sub.frequencia !== 'mensal';
                            const valorCiclo = isNonMonthly ? calcularTotalCiclo(sub.valor, sub.frequencia) : null;

                            const menuOptions = [
                                {
                                    label: "Ver Detalhes",
                                    icon: <Eye size={16} />,
                                    onClick: () => onViewDetails(sub)
                                },
                                ...(!isCancelled ? [
                                    { type: "separator" as const },
                                    {
                                        label: "Cancelar Assinatura",
                                        icon: <Trash size={16} />,
                                        onClick: () => onCancel(sub),
                                        variant: "danger" as const
                                    }
                                ] : [])
                            ];

                            return (
                                <TableRow
                                    key={sub.id}
                                    className={cn(
                                        isCancelled && "opacity-60",
                                        "animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 leading-tight">{sub.participante.nome}</span>
                                            <span className="text-[11px] text-gray-500 truncate max-w-[150px]">{sub.participante.email || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={sub.status} className="scale-75" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <StreamingLogo
                                                name={sub.streaming.catalogo.nome}
                                                iconeUrl={sub.streaming.catalogo.iconeUrl}
                                                color={sub.streaming.catalogo.corPrimaria}
                                                size="sm"
                                                rounded="md"
                                            />
                                            <span className="font-medium text-gray-700 text-sm truncate max-w-[100px]">
                                                {sub.streaming.apelido || sub.streaming.catalogo.nome}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1 text-[10px] text-primary uppercase font-black bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                            <CreditCard size={10} />
                                            {sub.frequencia}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {sub.cobrancas && sub.cobrancas.length > 0 ? (
                                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                <span>{formatFN(new Date(sub.cobrancas[0].periodoInicio), 'MMM/yy', { locale: ptBR })}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>{formatFN(new Date(sub.cobrancas[0].periodoFim), 'MMM/yy', { locale: ptBR })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="font-black text-sm text-gray-900 leading-tight">
                                                {format(Number(valorCiclo || sub.valor))}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                {format(Number(sub.valor))} / mês
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Dropdown options={menuOptions} />
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
