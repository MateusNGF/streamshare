"use client";

import { TableCell, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { Lock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell } from "../shared/BillingTableCells";
import { motion } from "framer-motion";
import React, { memo } from "react";

interface CobrancaSelectableRowProps {
    cobranca: any;
    isSelected: boolean;
    onToggle: () => void;
    isDisabled: boolean;
    options: any[];
    formatDate: (date: Date) => string;
}

const MotionTableRow = motion(TableRow);

export const CobrancaSelectableRow = memo(function CobrancaSelectableRow({
    cobranca,
    isSelected,
    onToggle,
    isDisabled,
    options,
    formatDate
}: CobrancaSelectableRowProps) {
    const isInLote = !!cobranca.lotePagamentoId;
    const isSelectable = ['pendente', 'atrasado'].includes(cobranca.status) && !isInLote;
    const isCancelled = cobranca.status === 'cancelado';

    return (
        <MotionTableRow
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
            transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={cn(
                "group transition-colors duration-200",
                isSelected ? "bg-primary/[0.04] border-l-primary shadow-sm" : "hover:bg-gray-50/50",
                isDisabled && "pointer-events-none",
                isCancelled && "opacity-100"
            )}
            title={isDisabled ? "Selecione cobranças de apenas um participante" : ""}
        >
            <TableCell className="px-4 py-3">
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

            <TableCell className="text-center font-medium text-xs text-gray-500">
                {formatDate(cobranca.createdAt).split(',')[0]}
            </TableCell>

            <TableCell className="px-4 py-3 text-center">
                <BillingDueDateCell data={cobranca.dataVencimento} status={cobranca.status} />
            </TableCell>

            <TableCell className="px-4 py-3 text-right">
                <BillingValueCell valor={cobranca.valor} />
            </TableCell>

            <TableCell className="text-center">
                <StatusBadge status={cobranca.status} className="scale-75" />
            </TableCell>

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

            <TableCell className="text-center">
                <Dropdown options={options} />
            </TableCell>
        </MotionTableRow>
    );
}, (prev, next) => {
    return prev.isSelected === next.isSelected &&
        prev.isDisabled === next.isDisabled &&
        prev.cobranca === next.cobranca;
});
