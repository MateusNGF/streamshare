"use client";

import { TableCell, TableRow } from "@/components/ui/Table";
import { User, Calendar, DollarSign, Eye, Clock, Hash, Check, MessageCircle, Trash, Lock, LockKeyhole } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell, BillingPeriodCell } from "@/components/cobrancas/shared/BillingTableCells";
import { motion } from "framer-motion";
import React, { memo } from "react";

const MotionTableRow = motion(TableRow);

export const getAvailableFaturaActions = (fatura: any, config: {
    isAdmin: boolean;
    onDetails: (id: number) => void;
    onPayAction?: (fatura: any) => void;
    onConfirm?: (id: number) => void;
    onWhatsApp?: (id: number) => void;
    onCancel?: (id: number) => void;
}) => {
    const { isAdmin, onDetails, onPayAction, onConfirm, onWhatsApp, onCancel } = config;

    const isPaid = fatura.status === 'pago';
    const isCancelled = fatura.status === 'cancelado';
    const isAwaiting = fatura.status === 'aguardando_aprovacao';
    const chavePix = fatura.assinatura?.participante?.conta?.chavePix;

    const actions: any[] = [
        {
            label: "Ver Detalhes",
            icon: <Eye size={16} />,
            onClick: () => onDetails(fatura.id)
        }
    ];

    if (!isPaid && !isCancelled && !isAwaiting && chavePix && !isAdmin) {
        actions.push({ type: "separator" as const });
        actions.push({
            label: "Pagar Fatura",
            icon: <DollarSign size={16} />,
            onClick: () => onPayAction?.(fatura)
        });
    }

    if (!isPaid && !isCancelled && isAwaiting && !isAdmin) {
        actions.push({ type: "separator" as const });
        actions.push({
            label: "Ver Comprovante",
            icon: <Eye size={16} className="text-amber-500" />,
            onClick: () => onDetails(fatura.id)
        });
    }

    if (!isPaid && !isCancelled && isAdmin) {
        actions.push({ type: "separator" as const });
        if (isAwaiting) {
            actions.push({
                label: "Validar Comprovante",
                icon: <Eye size={16} className="text-amber-500" />,
                onClick: () => onDetails(fatura.id)
            });
        } else {
            actions.push({
                label: "Confirmar Pagamento",
                icon: <Check size={16} />,
                onClick: () => onConfirm?.(fatura.id)
            });
        }

        actions.push({
            label: "Enviar WhatsApp",
            icon: <MessageCircle size={16} />,
            onClick: () => onWhatsApp?.(fatura.id)
        });

        actions.push({ type: "separator" as const });
        actions.push({
            label: "Cancelar Cobrança",
            icon: <Trash size={16} />,
            onClick: () => onCancel?.(fatura.id),
            variant: "danger" as const
        });
    }

    return actions;
};

interface FaturaTableRowProps {
    fatura: any;
    index: number;
    isAdmin?: boolean;
    onViewDetails: (id: number) => void;
    onConfirmPayment?: (id: number) => void;
    onSendWhatsApp?: (id: number) => void;
    onCancelPayment?: (id: number) => void;
    selectedIds: number[];
    handleSelect?: () => void;
    isDisabled?: boolean;
    setFaturaToPayOrResend?: (fatura: any) => void;
}

export const FaturaTableRow = memo(function FaturaTableRow({
    fatura,
    index,
    isAdmin = false,
    onViewDetails,
    onConfirmPayment,
    onSendWhatsApp,
    onCancelPayment,
    selectedIds,
    handleSelect,
    isDisabled,
    setFaturaToPayOrResend
}: FaturaTableRowProps) {
    const isCancelled = fatura.status === 'cancelado';
    const isAwaiting = fatura.status === 'aguardando_aprovacao';
    const isSelectable = !fatura.lotePagamentoId && (fatura.status === 'pendente' || fatura.status === 'atrasado');

    return (
        <MotionTableRow
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
            transition={{
                duration: 0.25,
                delay: index * 0.03,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={cn(
                isCancelled && "opacity-60",
                isAwaiting && !isAdmin && "bg-amber-50/30",
                "group transition-colors duration-200",
                isSelectable && selectedIds.includes(fatura.id) ? "bg-primary/[0.04] border-l-primary shadow-sm" : "hover:bg-gray-50/50",
                isDisabled && "opacity-40 grayscale pointer-events-none"
            )}
        >
            {!isAdmin && handleSelect && (
                <TableCell className="px-4 text-center">
                    {isSelectable ? (
                        <Checkbox
                            checked={selectedIds.includes(fatura.id)}
                            onCheckedChange={() => handleSelect()}
                        />
                    ) : (
                        <div className="flex justify-center" title="Fatura bloqueada em um lote">
                            <Lock size={14} className="text-gray-300" />
                        </div>
                    )}
                </TableCell>
            )}

            <TableCell>
                <div className="flex items-center gap-3">
                    <StreamingLogo
                        name={fatura.assinatura.streaming.catalogo.nome}
                        iconeUrl={fatura.assinatura.streaming.catalogo.iconeUrl}
                        color={fatura.assinatura.streaming.catalogo.corPrimaria}
                        size="sm"
                        rounded="md"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">
                            {fatura.assinatura.streaming.apelido || fatura.assinatura.streaming.catalogo.nome}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            ID: #{fatura.id}
                        </span>
                    </div>
                </div>
            </TableCell>

            <TableCell className="px-4 py-3 text-center">
                <BillingPeriodCell inicio={fatura.periodoInicio} fim={fatura.periodoFim} />
            </TableCell>

            <TableCell className="px-4 py-3">
                <BillingDueDateCell data={fatura.dataVencimento} status={fatura.status} />
            </TableCell>

            <TableCell className="text-center">
                <StatusBadge status={fatura.status} className="scale-75" />
            </TableCell>

            <TableCell className="text-center">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-700">
                        {fatura.assinatura.participante.conta.nome}
                    </span>
                    <span className="text-[9px] font-black uppercase text-gray-400">
                        Titular
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-4 py-3">
                <BillingValueCell
                    valor={fatura.valor}
                />
            </TableCell>

            <TableCell className="text-center">
                <Dropdown options={getAvailableFaturaActions(fatura, {
                    isAdmin,
                    onDetails: onViewDetails,
                    onPayAction: setFaturaToPayOrResend,
                    onConfirm: onConfirmPayment,
                    onWhatsApp: onSendWhatsApp,
                    onCancel: onCancelPayment
                })} />
            </TableCell>
        </MotionTableRow>
    );
}, (prev, next) => {
    // Custom equility logic to avoid unnecessary re-renders when selection changes
    const wasSelected = prev.selectedIds.includes(prev.fatura.id);
    const isSelected = next.selectedIds.includes(next.fatura.id);

    return wasSelected === isSelected &&
        prev.isDisabled === next.isDisabled &&
        prev.fatura === next.fatura;
});
