"use client";

import { Eye, MessageCircle, Check, XCircle, AlertCircle, Calendar } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { differenceInDays, isToday, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CobrancaCardProps {
    cobranca: any;
    isOverdue: boolean;
    formatDate: (date: Date) => string;
    formatPeriod: (start: Date, end: Date) => string;
    onViewDetails: () => void;
    onSendWhatsApp: () => void;
    onConfirmPayment: () => void;
    onCancel: () => void;
}

export function CobrancaCard({
    cobranca,
    isOverdue,
    onViewDetails,
    onSendWhatsApp,
    onConfirmPayment,
    onCancel
}: CobrancaCardProps) {
    const { format } = useCurrency();

    const isPaid = cobranca.status === 'pago';
    const isCancelled = cobranca.status === 'cancelado';
    const vencimentoDate = new Date(cobranca.dataVencimento);
    const today = startOfDay(new Date());
    const daysUntil = differenceInDays(vencimentoDate, today);

    // Lógica visual de urgência
    const getBorderColor = () => {
        if (isCancelled) return "border-l-gray-300";
        if (isPaid) return "border-l-green-600";
        if (isOverdue) return "border-l-red-500";
        if (isToday(vencimentoDate)) return "border-l-amber-500";
        return "border-l-primary/30";
    };

    const getBgColor = () => {
        if (isOverdue && !isPaid && !isCancelled) return "bg-red-50/30";
        if (isPaid) return "bg-green-50/10";
        return "bg-white";
    };

    const options = [
        { label: "Ver Detalhes", icon: <Eye size={16} />, onClick: onViewDetails },
        ...(cobranca.status === 'pendente' || cobranca.status === 'atrasado' ? [
            { type: "separator" as const },
            { label: "Confirmar Pagamento", icon: <Check size={16} />, onClick: onConfirmPayment, variant: "success" as const },
            { label: "Cancelar Cobrança", icon: <XCircle size={16} />, onClick: onCancel, variant: "danger" as const }
        ] : [])
    ];

    return (
        <div className={cn(
            "group relative rounded-xl border border-gray-200 border-l-4 shadow-sm hover:shadow-md transition-all w-full",
            getBorderColor(),
            getBgColor()
        )}>
            <div className="flex flex-col md:grid md:grid-cols-[240px_120px_120px_100px_100px_auto] gap-5 p-4 md:items-center">

                {/* 1. Logo & Participante */}
                <div className="flex items-center gap-3 min-w-0">
                    <StreamingLogo
                        name={cobranca.assinatura.streaming.catalogo.nome}
                        iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                        color={cobranca.assinatura.streaming.catalogo.corPrimaria}
                        size="md"
                        rounded="lg"
                    />

                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate pr-2">
                            {cobranca.assinatura.participante.nome}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">
                            {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                        </span>
                    </div>
                </div>

                {/* 2. Vencimento */}
                <div className="flex justify-between items-center md:flex-col md:items-center md:border-l md:border-gray-50">
                    <span className="text-xs text-gray-500 md:hidden font-medium">Vencimento</span>
                    <div className="flex flex-col items-end md:items-center">
                        <span className={cn(
                            "text-sm font-bold",
                            !isPaid && isOverdue ? "text-red-600" : "text-gray-700"
                        )}>
                            {vencimentoDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        {!isPaid && !isCancelled && (
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                {isToday(vencimentoDate) ? (
                                    <span className="text-amber-600">Hoje</span>
                                ) : daysUntil < 0 ? (
                                    <span className="text-red-600">{Math.abs(daysUntil)}d atraso</span>
                                ) : (
                                    <span className="text-gray-400">{daysUntil} dias</span>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. Pagamento */}
                <div className="flex justify-between items-center md:flex-col md:items-center md:border-l md:border-gray-50">
                    <span className="text-xs text-gray-500 md:hidden font-medium">Pagamento</span>
                    <div className="flex flex-col items-end md:items-center">
                        <span className={cn("text-sm font-bold", isPaid ? "text-green-600" : "text-gray-300")}>
                            {cobranca.dataPagamento ? new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                        </span>
                        {isPaid && <span className="text-[9px] text-green-500 font-black uppercase tracking-tighter">Confirmado</span>}
                    </div>
                </div>

                {/* 4. Valor */}
                <div className="flex justify-between items-center md:flex-col md:items-end md:border-l md:border-gray-50 md:pl-2">
                    <span className="text-xs text-gray-500 md:hidden font-medium">Valor</span>
                    <span className={cn(
                        "text-sm md:text-base font-black tracking-tight",
                        isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-900",
                        isCancelled && "line-through text-gray-300"
                    )}>
                        {format(Number(cobranca.valor))}
                    </span>
                </div>

                {/* 5. Status (Desktop Only) */}
                <div className="hidden md:flex justify-center">
                    <StatusBadge status={cobranca.status} className="scale-90" />
                </div>

                {/* 6. Ações */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 md:mt-0 md:pt-0 md:border-0">
                    {/* Status Badge (Mobile) */}
                    <div className="md:hidden flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                        <StatusBadge status={cobranca.status} className="scale-90" />
                    </div>

                    <div className="flex gap-2">
                        {/* Botão de WhatsApp Rápido */}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isPaid || isCancelled || !cobranca.assinatura.participante.whatsappNumero}
                            className="h-11 md:h-8 gap-2 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 flex-1 md:flex-none md:w-9 md:px-0"
                            onClick={onSendWhatsApp}
                        >
                            <MessageCircle size={18} className="md:w-4 md:h-4" />
                            <span className="md:hidden text-xs font-bold">Cobrar WhatsApp</span>
                        </Button>

                        {/* Botão Pagar Rápido (Mobile) */}
                        {!isPaid && !isCancelled && (
                            <Button
                                variant="outline"
                                disabled={isPaid || isCancelled}
                                size="sm"
                                className="h-11 md:h-8 gap-2 text-blue-700 border-blue-200 hover:bg-blue-50 md:hidden flex-1"
                                onClick={onConfirmPayment}
                            >
                                <Check size={18} />
                                <span className="text-xs font-bold">Pagar</span>
                            </Button>
                        )}

                        <div className="md:hidden flex items-center justify-center border border-gray-200 rounded-md px-2 h-11">
                            <Dropdown options={options} align="right" />
                        </div>
                    </div>

                    <div className="hidden md:block ml-1">
                        <Dropdown options={options} align="right" />
                    </div>
                </div>
            </div>
        </div>
    );
}