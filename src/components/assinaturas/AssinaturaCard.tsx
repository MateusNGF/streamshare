"use client";

import { Eye, Trash, CalendarClock, CreditCard } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils"; // Assumindo utilitário de classes

interface AssinaturaCardProps {
    sub: any;
    onViewDetails: () => void;
    onCancel: () => void;
}

export function AssinaturaCard({ sub, onViewDetails, onCancel }: AssinaturaCardProps) {
    const { format } = useCurrency();

    // Helper para identificar status visualmente
    const isActive = sub.status === 'ativo';
    const isCancelled = sub.status === 'cancelada';

    // Opções do menu
    const menuOptions = [
        {
            label: "Detalhes da Assinatura",
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
            "bg-white p-3 sm:p-4 rounded-2xl border transition-all group w-full flex items-center gap-3 sm:gap-5",
            "hover:shadow-lg hover:border-gray-200",
            // Alterar borda sutilmente baseada no status para feedback rápido
            isCancelled ? "border-gray-100 opacity-75" : "border-gray-100"
        )}>

            {/* 1. Identidade Visual e Participante */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <StreamingLogo
                        name={sub.streaming.catalogo.nome}
                        iconeUrl={sub.streaming.catalogo.iconeUrl}
                        color={sub.streaming.catalogo.corPrimaria}
                        size="md"
                        rounded="xl"
                        className="shadow-sm"
                    />
                    {/* Micro-indicador de status para mobile (Lei de Hick: remove decisão de ler status) */}
                    <div className={cn(
                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full sm:hidden",
                        isActive ? "bg-green-500" : isCancelled ? "bg-red-400" : "bg-yellow-400"
                    )} />
                </div>

                <div className="flex flex-col min-w-0 justify-center">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate leading-tight">
                        {sub.participante.nome}
                    </h3>

                    {/* Mobile: Mostra serviço aqui / Desktop: Mostra WhatsApp ou info secundária */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                        <span className="sm:hidden font-medium text-gray-600">
                            {sub.streaming.apelido || sub.streaming.catalogo.nome}
                        </span>
                        <span className="hidden sm:inline">
                            {sub.participante.whatsappNumero || "Sem contato"}
                        </span>

                        {/* Indicador de Frequência (Visualmente distinto) */}
                        {sub.frequencia !== 'mensal' && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 rounded font-bold uppercase tracking-wider">
                                    {sub.frequencia.slice(0, 3)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Coluna Central: Info de Serviço (Desktop Only) */}
            <div className="hidden md:flex flex-col w-[140px] border-l border-gray-50 pl-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    Plano
                </span>
                <div className="flex items-center gap-1.5">
                    <CreditCard size={12} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 truncate">
                        {sub.streaming.apelido || sub.streaming.catalogo.nome}
                    </span>
                </div>
            </div>

            {/* 3. Coluna Central: Datas (Desktop Only) */}
            <div className="hidden lg:flex flex-col w-[120px]">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    Início
                </span>
                <div className="flex items-center gap-1.5">
                    <CalendarClock size={12} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                        {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>

            {/* 4. Financeiro e Status (Adaptativo) */}
            <div className="flex flex-col items-end justify-center sm:items-start sm:w-[120px]">
                <div className="flex items-baseline gap-1">
                    <span className={cn(
                        "text-sm sm:text-base font-black tracking-tight",
                        isCancelled ? "text-gray-400 decoration-slate-400 line-through" : "text-gray-900"
                    )}>
                        {format(Number(sub.valor))}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium sm:hidden">/mês</span>
                </div>

                {/* Status Badge (Desktop) vs Texto simples (Mobile) */}
                <div className="hidden sm:block mt-1">
                    <StatusBadge
                        status={sub.status}
                        className="scale-90 origin-left"
                    />
                </div>
                {/* Texto de status sutil no mobile se não for ativo */}
                {!isActive && (
                    <span className="sm:hidden text-[9px] font-bold text-red-500 uppercase tracking-tight">
                        {sub.status}
                    </span>
                )}
            </div>

            {/* 5. Ações (Fixo à Direita) */}
            <div className="pl-2 border-l border-gray-50 sm:border-none">
                <Dropdown options={menuOptions} />
            </div>
        </div>
    );
}