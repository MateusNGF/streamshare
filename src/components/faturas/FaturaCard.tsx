"use client";

import { Copy, Calendar, Wallet, CheckCircle2, Clock } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { differenceInDays, isToday, startOfDay, format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface FaturaCardProps {
    fatura: any;
}

export function FaturaCard({ fatura }: FaturaCardProps) {
    const { format: formatPrice } = useCurrency();
    const { success, error: toastError } = useToast();

    const isPaid = fatura.status === 'pago';
    const isCancelled = fatura.status === 'cancelado';
    const vencimentoDate = new Date(fatura.dataVencimento);
    const today = startOfDay(new Date());
    const daysUntil = differenceInDays(vencimentoDate, today);
    const isOverdue = !isPaid && !isCancelled && daysUntil < 0;

    const copyPix = () => {
        const chavePix = fatura.assinatura.participante.conta.chavePix;
        if (!chavePix) {
            toastError("Chave Pix não cadastrada pelo proprietário da conta.");
            return;
        }
        navigator.clipboard.writeText(chavePix);
        success("Chave Pix copiada!");
    };

    const getBorderColor = () => {
        if (isCancelled) return "border-l-gray-300";
        if (isPaid) return "border-l-green-600";
        if (isOverdue) return "border-l-red-500";
        if (isToday(vencimentoDate)) return "border-l-amber-500";
        return "border-l-primary/30";
    };

    const getBgColor = () => {
        if (isOverdue) return "bg-red-50/10";
        if (isPaid) return "bg-green-50/5";
        return "bg-white";
    };

    return (
        <div className={cn(
            "group relative rounded-2xl border border-gray-100 border-l-4 shadow-sm hover:shadow-md transition-all w-full overflow-hidden",
            getBorderColor(),
            getBgColor()
        )}>
            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-6 p-6">

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* 1. Visual Service */}
                    <div className="relative">
                        <StreamingLogo
                            name={fatura.assinatura.streaming.catalogo.nome}
                            iconeUrl={fatura.assinatura.streaming.catalogo.iconeUrl}
                            color={fatura.assinatura.streaming.catalogo.corPrimaria}
                            size="lg"
                            rounded="2xl"
                        />
                        {isPaid && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                <CheckCircle2 size={12} />
                            </div>
                        )}
                    </div>

                    {/* 2. Service & Context */}
                    <div className="flex flex-col min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                {fatura.assinatura.streaming.apelido || fatura.assinatura.streaming.catalogo.nome}
                            </h3>
                            <StatusBadge status={fatura.status} className="scale-75 origin-left" />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 ">
                                <Wallet size={14} className="text-gray-400" />
                                <span className="opacity-70">Para:</span>
                                <span className="font-semibold text-gray-700">{fatura.assinatura.participante.conta.nome}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="opacity-70">Vencimento:</span>
                                <span className={cn(
                                    "font-semibold",
                                    isOverdue ? "text-red-600" : "text-gray-700"
                                )}>
                                    {format(vencimentoDate, "dd/MM/yyyy")}
                                </span>
                            </span>
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                            Período: {format(new Date(fatura.periodoInicio), "dd/MM")} - {format(new Date(fatura.periodoFim), "dd/MM/yy")}
                        </div>
                    </div>
                </div>

                {/* 3. Price & Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 pt-4 md:pt-0 border-t border-gray-50 md:border-0">
                    <div className="flex flex-col md:items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Valor Total</span>
                        <span className={cn(
                            "text-2xl font-black tracking-tight",
                            isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-900"
                        )}>
                            {formatPrice(Number(fatura.valor))}
                        </span>
                    </div>

                    {!isPaid && !isCancelled && (
                        <Button
                            size="default"
                            className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-6 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={copyPix}
                        >
                            <Copy size={18} />
                            Copiar Pix
                        </Button>
                    )}

                    {isPaid && (
                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-full">
                            <CheckCircle2 size={16} />
                            <span>Pago</span>
                        </div>
                    )}

                    {!isPaid && !isCancelled && !isOverdue && !isToday(vencimentoDate) && (
                        <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                            <Clock size={12} />
                            Faltam {daysUntil} dias
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
