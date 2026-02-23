"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { User, Calendar, DollarSign, Eye, Clock, Hash, Copy, Check, MessageCircle, AlertCircle, Trash } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell, BillingPeriodCell } from "@/components/cobrancas/shared/BillingTableCells";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { ModalPagamentoCobranca } from "./ModalPagamentoCobranca";

interface FaturasTableProps {
    faturas: any[];
    onViewDetails: (id: number) => void;
    isAdmin?: boolean;
    onConfirmPayment?: (id: number) => void;
    onSendWhatsApp?: (id: number) => void;
    onCancelPayment?: (id: number) => void;
}

export function FaturasTable({
    faturas,
    onViewDetails,
    isAdmin = false,
    onConfirmPayment,
    onSendWhatsApp,
    onCancelPayment
}: FaturasTableProps) {
    const { success, error: toastError } = useToast();
    const [faturaToPay, setFaturaToPay] = useState<any>(null);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const copyPix = (chavePix: string) => {
        if (!chavePix) {
            toastError("Chave Pix não cadastrada pelo proprietário da conta.");
            return;
        }
        navigator.clipboard.writeText(chavePix);
        success("Chave Pix copiada!");
    };

    if (faturas.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <EmptyState
                    icon={DollarSign}
                    title="Nenhuma fatura encontrada"
                    description="Quando você participar de uma assinatura, as faturas aparecerão aqui."
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
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <Hash size={12} className="text-gray-400" />
                                    Serviço
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[120px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock size={12} className="text-gray-400" />
                                    Período
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[110px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Vencimento
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-2">
                                    <User size={12} className="text-gray-400" />
                                    Responsável
                                </div>
                            </TableHead>

                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[100px]">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>

                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {faturas.map((fatura: any, index: number) => {
                            const isPaid = fatura.status === 'pago';
                            const isCancelled = fatura.status === 'cancelado';
                            const isAwaiting = fatura.status === 'aguardando_aprovacao';
                            const chavePix = fatura.assinatura?.participante?.conta?.chavePix;

                            const options = [
                                {
                                    label: "Ver Detalhes",
                                    icon: <Eye size={16} />,
                                    onClick: () => onViewDetails(fatura.id)
                                },
                                ...(!isPaid && !isCancelled && !isAwaiting && chavePix && !isAdmin ? [
                                    { type: "separator" as const },
                                    {
                                        label: "Pagar Fatura",
                                        icon: <DollarSign size={16} />,
                                        onClick: () => setFaturaToPay(fatura)
                                    }
                                ] : []),
                                ...(!isPaid && !isCancelled && isAdmin ? [
                                    { type: "separator" as const },
                                    ...(isAwaiting ? [{
                                        label: "Validar Comprovante",
                                        icon: <Eye size={16} className="text-amber-500" />,
                                        onClick: () => onViewDetails(fatura.id)
                                    }] : [{
                                        label: "Confirmar Pagamento",
                                        icon: <Check size={16} />,
                                        onClick: () => onConfirmPayment?.(fatura.id)
                                    }]),
                                    {
                                        label: "Enviar WhatsApp",
                                        icon: <MessageCircle size={16} />,
                                        onClick: () => onSendWhatsApp?.(fatura.id)
                                    },
                                    { type: "separator" as const },
                                    {
                                        label: "Cancelar Cobrança",
                                        icon: <Trash size={16} />,
                                        onClick: () => onCancelPayment?.(fatura.id),
                                        variant: "danger" as const
                                    }
                                ] : [])
                            ];

                            return (
                                <TableRow
                                    key={fatura.id}
                                    className={cn(
                                        isCancelled && "opacity-60",
                                        isAwaiting && !isAdmin && "bg-amber-50/30",
                                        isAwaiting && isAdmin && "bg-blue-50/40 border-l-4 border-l-blue-500",
                                        "group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
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
                                        <Dropdown options={options} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <ModalPagamentoCobranca
                isOpen={!!faturaToPay}
                onClose={() => setFaturaToPay(null)}
                fatura={faturaToPay}
            />
        </div>
    );
}
