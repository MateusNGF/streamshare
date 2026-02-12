"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User, TrendingUp, Calendar, DollarSign, Eye, Check, MessageCircle, Trash, Clock, Search } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { differenceInDays, startOfDay, isToday } from "date-fns";

interface CobrancasTableProps {
    cobrancas: any[];
    onViewDetails: (id: number) => void;
    onConfirmPayment: (id: number) => void;
    onSendWhatsApp: (id: number) => void;
    onCancel: (id: number) => void;
    searchTerm: string;
    statusFilter: string;
}

export function CobrancasTable({
    cobrancas,
    onViewDetails,
    onConfirmPayment,
    onSendWhatsApp,
    onCancel,
    searchTerm,
    statusFilter
}: CobrancasTableProps) {
    const { format } = useCurrency();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const isOverdue = (date: Date, status: string) => {
        return (status === 'pendente' || status === "atrasado") && new Date() > new Date(date);
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
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUp size={12} className="text-gray-400" />
                                    Emissão
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Vencimento
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>
                            <TableHead className="text-center text-[10px) font-black text-gray-500 uppercase tracking-wider">
                                Pagamento
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Transação
                            </TableHead>
                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cobrancas.map((cobranca: any) => {
                            const isPaid = cobranca.status === 'pago';
                            const isCancelled = cobranca.status === 'cancelado';
                            const atrasada = isOverdue(cobranca.dataVencimento, cobranca.status);

                            const options = [
                                {
                                    label: "Ver Detalhes",
                                    icon: <Eye size={16} />,
                                    onClick: () => onViewDetails(cobranca.id)
                                },
                                ...(!isPaid && !isCancelled ? [
                                    { type: "separator" as const },
                                    {
                                        label: "Confirmar Pagamento",
                                        icon: <Check size={16} />,
                                        onClick: () => onConfirmPayment(cobranca.id)
                                    },
                                    {
                                        label: "Enviar WhatsApp",
                                        icon: <MessageCircle size={16} />,
                                        onClick: () => onSendWhatsApp(cobranca.id)
                                    },
                                    {
                                        label: "Cancelar Cobrança",
                                        icon: <Trash size={16} />,
                                        onClick: () => onCancel(cobranca.id),
                                        variant: "danger" as const
                                    }
                                ] : [])
                            ];

                            return (
                                <TableRow key={cobranca.id} className={cn(isCancelled && "opacity-60")}>
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
                                    <TableCell className="text-center">
                                        <span className="text-xs font-medium">
                                            {formatDate(cobranca.createdAt).split(',')[0]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={cn(
                                                "text-xs font-medium",
                                                atrasada ? "text-red-600 font-bold" : "text-gray-700"
                                            )}>
                                                {formatDate(cobranca.dataVencimento)}
                                            </span>
                                            {atrasada && (
                                                <div className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                                                    <Clock size={8} />
                                                    ATRASADA
                                                </div>
                                            )}
                                            {!atrasada && cobranca.status === 'pendente' && (
                                                <>
                                                    {isToday(new Date(cobranca.dataVencimento)) ? (
                                                        <div className="flex items-center gap-1 text-[9px] text-orange-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                                                            <Clock size={8} />
                                                            VENCE HOJE
                                                        </div>
                                                    ) : (() => {
                                                        const dias = differenceInDays(startOfDay(new Date(cobranca.dataVencimento)), startOfDay(new Date()));
                                                        return dias > 0 ? (
                                                            <div className="flex items-center gap-1 text-[9px] text-blue-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                                                                <Clock size={8} />
                                                                FALTAM {dias} DIAS
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={cobranca.status} className="scale-75" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-black text-gray-700">
                                            {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento).split(',')[0] : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-black text-gray-900 text-sm">
                                            {format(Number(cobranca.valor))}
                                        </span>
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
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
