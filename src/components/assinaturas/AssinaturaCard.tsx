"use client";

import { Eye, Trash, CreditCard, User, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/streaming-logo";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { calcularTotalCiclo } from "@/lib/financeiro-utils";
import { Tooltip } from "@/components/ui/tooltip";

interface AssinaturaCardProps {
    sub: any;
    onViewDetails: () => void;
    onCancel: () => void;
}

export function AssinaturaCard({ sub, onViewDetails, onCancel }: AssinaturaCardProps) {
    const { format } = useCurrency();

    const isActive = sub.status === 'ativa';
    const isSuspended = sub.status === 'suspensa';
    const isCancelled = sub.status === 'cancelada';

    // Cycle context for non-monthly frequencies
    const isNonMonthly = sub.frequencia !== 'mensal';
    const valorCiclo = isNonMonthly ? calcularTotalCiclo(sub.valor, sub.frequencia) : null;

    const menuOptions = [
        {
            label: "Ver Detalhes",
            icon: <Eye size={16} />,
            onClick: onViewDetails
        },
        ...(!isCancelled ? [
            { type: "separator" as const },
            {
                label: "Cancelar Assinatura",
                icon: <Trash size={16} />,
                onClick: onCancel,
                variant: "danger" as const
            }
        ] : [])
    ];

    return (
        <div className={cn(
            "group relative bg-white rounded-xl border transition-all duration-200 w-full overflow-hidden",
            "hover:shadow-md hover:border-primary/20",
            isCancelled ? "border-gray-100 opacity-75 bg-gray-50/50" : "border-gray-200"
        )}>
            {/* Indicador lateral de status (Visual Cue) */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                isActive ? "bg-green-600" : isSuspended ? "bg-amber-500" : isCancelled ? "bg-gray-300" : "bg-gray-200"
            )} />

            <div className="flex flex-col md:grid md:grid-cols-[40px_240px_1fr_100px_auto] md:items-center p-4 pl-5 gap-4">
                {/* 0. Ações (Dropdown) - Deslocado para o início */}
                <div className="flex items-center justify-between md:justify-start">
                    <div className="md:h-8 h-11 flex items-center">
                        <Dropdown options={menuOptions} />
                    </div>
                    {/* Status Dot apenas Mobile */}
                    <div className={cn(
                        "w-3.5 h-3.5 border-2 border-white rounded-full md:hidden",
                        isActive ? "bg-green-600" : isSuspended ? "bg-amber-500" : isCancelled ? "bg-gray-400" : "bg-gray-200"
                    )} />
                </div>

                <div className="flex items-start md:items-center gap-3 w-full">
                    <div className="relative">
                        <StreamingLogo
                            name={sub.streaming.catalogo.nome}
                            iconeUrl={sub.streaming.catalogo.iconeUrl}
                            color={sub.streaming.catalogo.corPrimaria}
                            size="md"
                            rounded="lg"
                            className="shadow-sm"
                        />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {sub.participante.nome}
                            </h3>
                            {/* Badge de Serviço no Mobile ao lado do nome */}
                            <span className="md:hidden text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full truncate max-w-[100px]">
                                {sub.streaming.apelido || sub.streaming.catalogo.nome}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <User size={12} />
                            <span className="truncate">{sub.participante.email || "Sem email"}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Detalhes do Serviço (Desktop Only - Coluna Dedicada) */}
                <div className="hidden md:flex flex-col min-w-0 border-l border-gray-100 pl-4">
                    <span className="text-sm font-medium text-gray-700 truncate">
                        {sub.streaming.apelido || sub.streaming.catalogo.nome}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <CreditCard size={10} className="text-gray-400" />
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                            {sub.frequencia}
                        </span>
                    </div>
                </div>

                {/* 3. Status (Desktop Only) */}
                <div className="hidden md:flex justify-center">
                    <StatusBadge status={sub.status} className="scale-90" />
                </div>

                {/* 4. Valor (Layout Híbrido) */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t border-gray-100 pt-3 md:pt-0 md:border-0">
                    <div className="flex flex-col md:hidden">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custo Mensal</span>
                        <StatusBadge status={sub.status} className="scale-75 origin-left -ml-1 mt-1" />
                    </div>

                    <div className="flex flex-col items-end">
                        <span className={cn(
                            "text-sm font-black",
                            isCancelled ? "text-gray-400 line-through" : "text-gray-900"
                        )}>
                            {format(Number(sub.valor))} <span className="text-[10px] font-medium text-gray-500">/ mês</span>
                        </span>

                        {isNonMonthly && valorCiclo && (
                            <Tooltip
                                content={`Valor total cobrado a cada ciclo ${sub.frequencia}: ${format(Number(valorCiclo))}`}
                                position="bottom"
                            >
                                <div className="flex items-center gap-1 text-[9px] font-bold text-primary cursor-help">
                                    <AlertCircle size={8} />
                                    <span>CICLO: {format(Number(valorCiclo))}</span>
                                </div>
                            </Tooltip>
                        )}
                        {!isNonMonthly && <span className="text-[10px] text-gray-400 hidden md:block">por pessoa</span>}
                    </div>
                </div>

                {/* 5. Valor Integral (Desktop Only - Contexto) */}
                <div className="hidden md:flex flex-col items-end opacity-60">
                    <span className="text-xs font-semibold text-gray-600">
                        {format(Number(sub.streaming.valorIntegral))}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase">Total Grupo</span>
                </div>

                {/* 5. Ações (Removidas daqui) */}
            </div>
        </div>
    );
}