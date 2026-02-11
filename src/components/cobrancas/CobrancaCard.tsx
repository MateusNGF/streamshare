"use client";

import { Eye, MessageCircle, Check, XCircle, Calendar, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

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
            "bg-white p-3 sm:p-4 rounded-2xl border transition-all group w-full flex items-center gap-3 sm:gap-5",
            "hover:shadow-lg",
            // Bordas contextuais: Vermelho se atrasado, Verde se pago, Cinza padrão
            isOverdue && !isPaid ? "border-red-200 bg-red-50/10" : isPaid ? "border-green-100/50" : "border-gray-100"
        )}>

            {/* 1. Identidade e Contexto */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <StreamingLogo
                        name={cobranca.assinatura.streaming.catalogo.nome}
                        iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                        color={cobranca.assinatura.streaming.catalogo.corPrimaria}
                        size="md"
                        rounded="xl"
                        className={cn("shadow-sm", isPaid && "opacity-80")}
                    />
                    {/* Indicador de Status Compacto (Mobile/Desktop) */}
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
                        {/* Nome do Streaming ou Mês de Referência */}
                        <span className="font-medium truncate">
                            {cobranca.assinatura.streaming.apelido || formatHumanPeriod(cobranca.periodoInicio, cobranca.periodoFim)}
                        </span>

                        {/* Data de Vencimento (Visível no Mobile se estiver atrasado para gerar urgência) */}
                        <span className={cn(
                            "flex items-center gap-1",
                            isOverdue && !isPaid ? "text-red-600 font-bold" : "text-gray-400"
                        )}>
                            <span className="text-[10px]">•</span>
                            {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Coluna Central: Detalhes de Data (Desktop Only) */}
            <div className="hidden md:flex flex-col w-[140px] border-l border-gray-50 pl-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    {isPaid ? "Pagamento" : "Vencimento"}
                </span>
                <div className="flex items-center gap-1.5">
                    <Calendar size={12} className={isOverdue && !isPaid ? "text-red-500" : "text-gray-400"} />
                    <span className={cn(
                        "text-xs font-semibold truncate",
                        isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-700"
                    )}>
                        {isPaid && cobranca.dataPagamento
                            ? new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR')
                            : new Date(cobranca.periodoFim).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>

            {/* 3. Valor e Status (Adaptativo) */}
            <div className="flex flex-col items-end justify-center sm:items-start sm:w-[110px]">
                <span className={cn(
                    "text-sm sm:text-base font-black tracking-tight",
                    isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-900",
                    isCancelled && "line-through text-gray-300"
                )}>
                    {format(Number(cobranca.valor))}
                </span>

                {/* Badge no Desktop, Texto invisível no mobile (já tem o ícone no logo) */}
                <div className="hidden sm:block mt-0.5">
                    <StatusBadge status={cobranca.status} className="scale-90 origin-left" />
                </div>

                {/* Texto de reforço de status no mobile apenas se for crítico */}
                {isOverdue && !isPaid && (
                    <span className="sm:hidden text-[9px] font-bold text-red-500 uppercase tracking-tight">
                        Atrasado
                    </span>
                )}
            </div>

            {/* 4. Ações (Fixo à Direita com separador) */}
            <div className="pl-2 border-l border-gray-50 sm:border-none">
                <Dropdown options={getOptions()} />
            </div>
        </div>
    );
}