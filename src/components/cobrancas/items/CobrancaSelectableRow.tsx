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

interface CobrancaSelectableRowProps {
    cobranca: any;
    isSelected: boolean;
    onToggle: () => void;
    isDisabled: boolean;
    options: any[];
    formatDate: (date: Date) => string;
}

export function CobrancaSelectableRow({
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
        <TableRow
            className={cn(
                isCancelled && "opacity-60",
                "group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both transition-all duration-200",
                isSelected ? "bg-primary/[0.04] border-l-primary shadow-sm" : "hover:bg-gray-50/50",
                isDisabled && "opacity-40 grayscale pointer-events-none"
            )}
            title={isDisabled ? "Selecione cobranças de apenas um participante" : ""}
        >
            <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Checkbox Container with fixed width for alignment */}
                    <div className="flex items-center justify-center w-4 h-4">
                        {isSelectable ? (
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center justify-center"
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={onToggle}
                                />
                            </motion.div>
                        ) : isInLote ? (
                            <div className="flex justify-center w-full h-full" title={`Lote #${cobranca.lotePagamentoId}`}>
                                <Lock size={14} className="text-primary/60" />
                            </div>
                        ) : null}
                    </div>

                    {/* Content Container */}
                    <div className="flex items-center gap-3 ml-1">
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
                                Ref: {formatDate(cobranca.createdAt).split(',')[0]}
                            </span>
                            {isInLote && (
                                <span className="flex items-center gap-1 text-[8px] text-primary font-black uppercase tracking-tighter mt-0.5">
                                    <Hash size={8} /> Lote {cobranca.lotePagamentoId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>

            <TableCell className="text-center font-medium text-xs text-gray-500">
                {formatDate(cobranca.createdAt).split(',')[0]}
            </TableCell>

            <TableCell className="px-4 py-3 text-center">
                <BillingDueDateCell data={cobranca.dataVencimento} status={cobranca.status} />
            </TableCell>

            <TableCell className="text-center">
                <StatusBadge status={cobranca.status} className="scale-75" />
            </TableCell>

            <TableCell className="text-center text-sm font-black text-gray-700">
                {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento).split(',')[0] : "-"}
            </TableCell>

            <TableCell className="px-4 py-3">
                <BillingValueCell valor={cobranca.valor} />
            </TableCell>

            <TableCell className="text-center text-xs">
                {cobranca.gatewayProvider || "Manual"}
            </TableCell>

            <TableCell className="text-center">
                <Dropdown options={options} />
            </TableCell>
        </TableRow>
    );
}
