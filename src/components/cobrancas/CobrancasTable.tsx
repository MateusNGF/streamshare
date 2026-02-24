"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { User, TrendingUp, Calendar, DollarSign, Eye, Check, MessageCircle, Trash, Clock, Search, History, QrCode, AlertCircle } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell, BillingPeriodCell } from "./shared/BillingTableCells";

interface CobrancasTableProps {
    cobrancas: any[];
    onViewDetails: (id: number) => void;
    onConfirmPayment?: (id: number) => void;
    onSendWhatsApp?: (id: number) => void;
    onCancelPayment?: (id: number) => void;
    onViewQrCode?: (id: number) => void;
    searchTerm?: string;
    statusFilter?: string;
    variant?: "default" | "compact";
    fallbackValorMensal?: number | string;
    isAdmin?: boolean;
    onGeneratePix?: (id: number) => void;
}

/**
 * SRP: Centraliza a lógica de quais ações estão disponíveis para uma cobrança.
 * Isso isola a regra de negócio da lógica de renderização da tabela.
 */
const getAvailableCobrancaActions = (cobranca: any, config: {
    isAdmin: boolean;
    onDetails: (id: number) => void;
    onQrCode?: (id: number) => void;
    onConfirm?: (id: number) => void;
    onWhatsApp?: (id: number) => void;
    onCancel?: (id: number) => void;
}) => {
    const { isAdmin, onDetails, onQrCode, onConfirm, onWhatsApp, onCancel } = config;

    const isPaid = cobranca.status === 'pago';
    const isCancelled = cobranca.status === 'cancelado';
    const isPendingOrOverdue = ['pendente', 'atrasado'].includes(cobranca.status);
    const canManageAdmin = !isPaid && !isCancelled && isAdmin;

    const actions: any[] = [
        {
            label: "Ver Detalhes",
            icon: <Eye size={16} />,
            onClick: () => onDetails(cobranca.id)
        }
    ];

    // Regra: Participantes veem QR Code. Admins não precisam (já têm Confirmar Pagamento).
    if (isPendingOrOverdue && !isAdmin) {
        actions.push({
            label: "Ver QR Code / PIX",
            icon: <QrCode size={16} />,
            onClick: () => onQrCode ? onQrCode(cobranca.id) : onDetails(cobranca.id)
        });
    }

    // Ações exclusivas para Administradores
    if (canManageAdmin) {
        actions.push({ type: "separator" as const });

        actions.push({
            label: "Confirmar Pagamento",
            icon: <Check size={16} />,
            onClick: () => onConfirm?.(cobranca.id)
        });

        actions.push({
            label: "Enviar WhatsApp",
            icon: <MessageCircle size={16} />,
            onClick: () => onWhatsApp?.(cobranca.id)
        });

        actions.push({ type: "separator" as const });

        actions.push({
            label: "Cancelar",
            icon: <AlertCircle size={16} />,
            onClick: () => onCancel?.(cobranca.id),
            variant: "danger" as const
        });
    }

    return actions;
};

export function CobrancasTable({
    cobrancas,
    onViewDetails,
    onConfirmPayment,
    onSendWhatsApp,
    onCancelPayment,
    onViewQrCode,
    searchTerm = "",
    statusFilter = "all",
    variant = "default",
    fallbackValorMensal,
    isAdmin = true,
    onGeneratePix
}: CobrancasTableProps) {
    const isCompact = variant === "compact";

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (cobrancas.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                <EmptyState
                    icon={searchTerm || statusFilter !== 'all' ? Search : DollarSign}
                    title={searchTerm || statusFilter !== 'all' ? "Nenhuma cobrança encontrada" : "Tudo limpo!"}
                    description="Nenhuma cobrança corresponde aos critérios atuais."
                    className="bg-transparent border-none py-12"
                />
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
            isCompact && "rounded-xl shadow-none border-gray-100/50"
        )}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            {!isCompact && (
                                <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[160px]">
                                    <div className="flex items-center gap-2">
                                        <User size={12} className="text-gray-400" />
                                        Participante
                                    </div>
                                </TableHead>
                            )}

                            {isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[120px]">
                                    <div className="flex items-center justify-center gap-2">
                                        <History size={12} className="text-gray-400" />
                                        Período
                                    </div>
                                </TableHead>
                            )}

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUp size={12} className="text-gray-400" />
                                        Emissão
                                    </div>
                                </TableHead>
                            )}

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[110px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Vencimento
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    Pagamento
                                </TableHead>
                            )}

                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[100px]">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    Transação
                                </TableHead>
                            )}

                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cobrancas.slice(0, isCompact ? 5 : undefined).map((cobranca: any, index: number) => {
                            const isPaid = cobranca.status === 'pago';
                            const isCancelled = cobranca.status === 'cancelado';

                            // Refatoração Clean Code: Delegando a lógica de ações para uma construção mais clara
                            const options = getAvailableCobrancaActions(cobranca, {
                                isAdmin,
                                onDetails: onViewDetails,
                                onQrCode: onViewQrCode,
                                onConfirm: onConfirmPayment,
                                onWhatsApp: onSendWhatsApp,
                                onCancel: onCancelPayment
                            });

                            return (
                                <TableRow
                                    key={cobranca.id}
                                    className={cn(
                                        isCancelled && "opacity-60",
                                        "group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {!isCompact && (
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
                                                        {cobranca.assinatura.participante.nome}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[100px]">
                                                        {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}

                                    {isCompact && (
                                        <TableCell className="px-4 py-3">
                                            <BillingPeriodCell inicio={cobranca.periodoInicio} fim={cobranca.periodoFim} />
                                        </TableCell>
                                    )}

                                    {!isCompact && (
                                        <TableCell className="text-center font-medium text-xs text-gray-500">
                                            {formatDate(cobranca.createdAt).split(',')[0]}
                                        </TableCell>
                                    )}

                                    <TableCell className="px-4 py-3">
                                        <BillingDueDateCell data={cobranca.dataVencimento} status={cobranca.status} />
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <StatusBadge status={cobranca.status} className="scale-75" />
                                    </TableCell>

                                    {!isCompact && (
                                        <TableCell className="text-center text-sm font-black text-gray-700">
                                            {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento).split(',')[0] : "-"}
                                        </TableCell>
                                    )}

                                    <TableCell className="px-4 py-3">
                                        <BillingValueCell
                                            valor={cobranca.valor}
                                        />
                                    </TableCell>

                                    {!isCompact && (
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
                                    )}

                                    <TableCell className="text-center">
                                        <Dropdown options={options} />
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
