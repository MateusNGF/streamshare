"use client";

import { Eye, MessageCircle, Check, XCircle, Calendar, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { differenceInDays, isToday, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    formatDate,
    formatPeriod,
    onViewDetails,
    onSendWhatsApp,
    onConfirmPayment,
    onCancel
}: CobrancaCardProps) {
    const { format } = useCurrency();

    // Estados derivados para facilitar a lógica visual
    const isPaid = cobranca.status === 'pago';
    const isPending = cobranca.status === 'pendente';
    const isCancelled = cobranca.status === 'cancelado';

    const vencimentoDate = new Date(cobranca.dataVencimento);
    const today = startOfDay(new Date());
    const daysUntilVencimento = differenceInDays(vencimentoDate, today);

    // Função auxiliar para período curto (ex: JAN/24)
    const formatHumanPeriod = (start: Date, end: Date) => {
        const d1 = new Date(start);
        return d1.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
    };

    const getOptions = () => {
        const options = [];
        options.push({ label: "Detalhes", icon: <Eye size={16} />, onClick: onViewDetails });

        if (cobranca.assinatura.participante.whatsappNumero && !isPaid && !isCancelled) {
            options.push({ label: "Enviar WhatsApp", icon: <MessageCircle size={16} />, onClick: onSendWhatsApp });
        }

        if (isPending || cobranca.status === "atrasado") {
            options.push({ type: "separator" as const });
            options.push({
                label: "Confirmar Pagamento",
                icon: <Check size={16} />,
                onClick: onConfirmPayment,
                variant: "success" as const,
            });
            options.push({
                label: "Cancelar Cobrança",
                icon: <XCircle size={16} />,
                onClick: onCancel,
                variant: "danger" as const,
            });
        }
        return options;
    };

    return (
        <div className={cn(
            "bg-white p-3 sm:p-4 rounded-2xl border transition-all group w-full flex flex-col gap-3",
            "hover:shadow-lg",
            // Bordas contextuais: Vermelho se atrasado, Verde se pago, Cinza padrão
            isOverdue && !isPaid ? "border-red-200 bg-red-50/10" : isPaid ? "border-green-100/50" : "border-gray-100"
        )}>
            {/* Main Row: Mobile Flex, Desktop Grid */}
            <div className="flex items-center md:grid md:grid-cols-[1fr_120px_120px_110px_auto] gap-3 sm:gap-5 w-full">

                {/* 1. Identidade e Contexto */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                        <StreamingLogo
                            name={cobranca.assinatura.streaming.catalogo.nome}
                            iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                            color={cobranca.assinatura.streaming.catalogo.corPrimaria}
                            size="md"
                            rounded="xl"
                            className={cn("shadow-sm", isPaid && "opacity-80")}
                        />
                        <div className={cn(
                            "absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full border-2 border-white",
                            isPaid ? "bg-green-500 text-white" : isOverdue ? "bg-red-500 text-white" : "bg-yellow-400"
                        )}>
                            {isPaid ? <Check size={8} strokeWidth={4} /> : isOverdue ? <AlertCircle size={8} strokeWidth={4} /> : null}
                        </div>
                    </div>

                    <div className="flex flex-col min-w-0 justify-center">
                        <h3 className={cn(
                            "font-bold text-sm sm:text-base truncate leading-tight",
                            isPaid ? "text-gray-600" : "text-gray-900"
                        )}>
                            {cobranca.assinatura.participante.nome}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                            <span className="text-[10px]">•</span>
                            {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* 2. Coluna Vencimento (Desktop Only) */}
                <div className="hidden md:flex flex-col w-[120px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Vencimento
                    </span>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className={isOverdue && !isPaid ? "text-red-500" : "text-gray-400"} />
                            <span className={cn(
                                "text-xs font-semibold truncate",
                                isOverdue && !isPaid ? "text-red-600" : "text-gray-700"
                            )}>
                                {vencimentoDate.toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        {!isPaid && !isCancelled && (
                            <div className="h-4">
                                {isToday(vencimentoDate) ? (
                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 leading-none h-4">Vence hoje</Badge>
                                ) : daysUntilVencimento > 0 && daysUntilVencimento <= 3 ? (
                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 leading-none h-4">Faltam {daysUntilVencimento} dias</Badge>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Coluna Pagamento (Desktop Only) */}
                <div className={cn("hidden md:flex flex-col w-[120px] transition-opacity", !isPaid && "opacity-0 pointer-events-none")}>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Pagamento
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-green-500" />
                        <span className="text-xs font-semibold truncate text-green-600">
                            {cobranca.dataPagamento ? new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                        </span>
                    </div>
                </div>

                {/* 4. Valor e Status */}
                <div className="flex flex-col items-end justify-center sm:items-start sm:w-[110px]">
                    <span className={cn(
                        "text-sm sm:text-base font-black tracking-tight",
                        isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-900",
                        isCancelled && "line-through text-gray-300"
                    )}>
                        {format(Number(cobranca.valor))}
                    </span>

                    <div className="hidden sm:block mt-0.5">
                        <StatusBadge status={cobranca.status} className="scale-90 origin-left" />
                    </div>

                    {isOverdue && !isPaid && (
                        <span className="sm:hidden text-[9px] font-bold text-red-500 uppercase tracking-tight">
                            Atrasado
                        </span>
                    )}
                </div>

                {/* 5. Ações */}
                <div className="flex items-center gap-1 pl-2 border-l border-gray-50 sm:border-none">
                    {cobranca.assinatura.participante.whatsappNumero && !isPaid && !isCancelled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onSendWhatsApp}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
                            title="Enviar WhatsApp"
                        >
                            <MessageCircle size={18} />
                        </Button>
                    )}
                    <Dropdown options={getOptions()} />
                </div>
            </div>

            {/* Mobile-only Footer with Dates (Flex Col) */}
            <div className="flex md:hidden flex-col gap-2 pt-2 mt-1 border-t border-gray-50/50">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Vencimento</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={10} className={isOverdue && !isPaid ? "text-red-500" : "text-gray-400"} />
                            <span className={cn(
                                "text-xs font-medium",
                                isOverdue && !isPaid ? "text-red-600" : "text-gray-600"
                            )}>
                                {vencimentoDate.toLocaleDateString('pt-BR')}
                            </span>
                            {!isPaid && !isCancelled && isToday(vencimentoDate) && (
                                <Badge variant="warning" className="text-[9px] px-1 py-0 h-3.5 leading-none">Hoje</Badge>
                            )}
                            {!isPaid && !isCancelled && !isToday(vencimentoDate) && daysUntilVencimento > 0 && daysUntilVencimento <= 3 && (
                                <Badge variant="warning" className="text-[9px] px-1 py-0 h-3.5 leading-none">Faltam {daysUntilVencimento}d</Badge>
                            )}
                        </div>
                    </div>

                    {isPaid && (
                        <div className="flex flex-col gap-0.5 items-end text-right">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pagamento</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-green-600">
                                    {cobranca.dataPagamento ? new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                                </span>
                                <Calendar size={10} className="text-green-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
