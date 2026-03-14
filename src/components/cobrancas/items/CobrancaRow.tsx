"use client";

import { TableCell, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { Lock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell, BillingPeriodCell } from "../shared/BillingTableCells";
import React, { memo } from "react";

interface CobrancaRowProps {
    cobranca: any;
    index: number;
    isCompact: boolean;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
    options: any[];
    formatDate: (date: Date) => string;
}

export const CobrancaRow = memo(function CobrancaRow({
    cobranca,
    index,
    isCompact,
    selectedIds,
    onToggleSelect,
    options,
    formatDate
}: CobrancaRowProps) {
    const isInLote = !!cobranca.lotePagamentoId;
    const isCancelled = cobranca.status === 'cancelado';
    const isSelected = selectedIds?.has(cobranca.id);
    const isSelectable = ['pendente', 'atrasado'].includes(cobranca.status) && !isInLote;

    return (
        <TableRow
            key={cobranca.id}
            className={cn(
                "group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both transition-all duration-200",
                isSelected ? "bg-primary/[0.04] border-l-primary" : "hover:bg-gray-50/50",
                (isCancelled) && "opacity-100" // Ensuring no opacity on cancelled
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => isSelectable && onToggleSelect?.(cobranca.id)}
        >
            <TableCell>
                <div className="flex items-center gap-3">
                    <StreamingLogo
                        name={cobranca.assinatura.streaming.catalogo.nome}
                        iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                        color={cobranca.assinatura.streaming.catalogo.corPrimaria}
                        size="sm"
                        rounded="md"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">
                            {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            ID: #{cobranca.id}
                        </span>
                    </div>
                </div>
            </TableCell>

            <TableCell className="text-center">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-700">
                        {cobranca.assinatura.participante.nome}
                    </span>
                    {isInLote && (
                        <span className="flex items-center gap-1 text-[8px] text-primary font-black uppercase tracking-tighter mt-0.5">
                            <Hash size={8} /> Lote {cobranca.lotePagamentoId}
                        </span>
                    )}
                </div>
            </TableCell>

            {isCompact ? (
                <TableCell className="px-4 py-3 text-center">
                    <BillingPeriodCell inicio={cobranca.periodoInicio} fim={cobranca.periodoFim} />
                </TableCell>
            ) : (
                <TableCell className="text-center font-medium text-xs text-gray-500">
                    {formatDate(cobranca.createdAt).split(',')[0]}
                </TableCell>
            )}

            <TableCell className="px-4 py-3">
                <BillingDueDateCell data={cobranca.dataVencimento} status={cobranca.status} />
            </TableCell>

            <TableCell className="px-4 py-3 text-right">
                <BillingValueCell valor={cobranca.valor} />
            </TableCell>

            <TableCell className="text-center">
                <StatusBadge status={cobranca.status} className="scale-75" />
            </TableCell>

            {!isCompact && (
                <>
                    <TableCell className="text-center text-sm font-black text-gray-700">
                        {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento).split(',')[0] : "-"}
                    </TableCell>

                    <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
                                {cobranca.gatewayProvider || "Manual"}
                            </span>
                            {cobranca.gatewayTransactionId && (
                                <span className="text-[9px] text-gray-400 font-mono truncate max-w-[60px]" title={cobranca.gatewayTransactionId}>
                                    ID:{cobranca.gatewayTransactionId.slice(-6)}
                                </span>
                            )}
                        </div>
                    </TableCell>
                </>
            )}

            <TableCell className="text-center">
                <Dropdown options={options} />
            </TableCell>
        </TableRow>
    );
}, (prev, next) => {
    const wasSelected = prev.selectedIds?.has(prev.cobranca.id);
    const isSelected = next.selectedIds?.has(next.cobranca.id);
    return wasSelected === isSelected &&
        prev.isCompact === next.isCompact &&
        prev.cobranca === next.cobranca;
});
