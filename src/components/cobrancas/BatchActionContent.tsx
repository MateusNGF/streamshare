"use client";

import { X, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { CurrencyCode } from "@/types/currency.types";
import { cn } from "@/lib/utils";

interface BatchActionContentProps {
    count: number;
    total: number;
    currencyCode: CurrencyCode;
    isAdmin: boolean;
    onPay: () => void;
    onClear: () => void;
    loading: boolean;
    hasMixedParticipants: boolean;
    hasSummary: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export function BatchActionContent({
    count,
    total,
    currencyCode,
    isAdmin,
    onPay,
    onClear,
    loading,
    hasMixedParticipants,
    hasSummary,
    isExpanded,
    onToggleExpand
}: BatchActionContentProps) {
    return (
        <div className="max-w-[1400px] mx-auto w-full px-5 sm:px-8 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6">

            {/* Top/Left Row: Selection Info & Total */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 sm:gap-8">

                {/* Clear & Count */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={onClear}
                        disabled={loading}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors shrink-0 disabled:opacity-50"
                        title="Limpar seleção"
                    >
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[12px] sm:text-sm font-bold text-gray-800 leading-tight">
                            {count} {count === 1 ? 'selecionado' : 'selecionados'}
                        </span>
                        <button onClick={onClear} className="text-[10px] sm:text-[11px] text-gray-400 text-left font-medium hover:text-gray-600 transition-colors">
                            Limpar tudo
                        </button>
                    </div>
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

                {/* Total & Toggle */}
                <div
                    className={cn(
                        "flex flex-col items-end sm:items-start transition-opacity select-none group",
                        hasSummary && "cursor-pointer hover:opacity-80 active:opacity-60"
                    )}
                    onClick={hasSummary ? onToggleExpand : undefined}
                >
                    <div className="flex items-center gap-1.5 text-gray-400 shrink-0 mb-0.5">
                        <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-widest leading-none mt-1">
                            Total a Pagar
                        </span>
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight leading-none">
                        {formatCurrency(total, currencyCode)}
                    </span>
                    {hasSummary && (
                        <div className="flex items-center gap-1 mt-1 text-primary/80 group-hover:text-primary transition-colors">
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Ver detalhes</span>
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom/Right Row: Actions */}
            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-2.5">
                {hasMixedParticipants && (
                    <span className="text-[10px] sm:text-xs font-semibold text-amber-500 text-center sm:text-right w-full sm:w-auto sm:mr-3 leading-tight">
                        Selecione apenas 1 participante
                    </span>
                )}

                <div className="flex w-full sm:w-auto gap-2.5">
                    <Button
                        size="lg"
                        className={cn(
                            "flex-none sm:min-w-[160px] h-10 sm:h-12 text-xs sm:text-sm rounded-xl sm:rounded-full font-bold shadow-sm hover:shadow-md transition-all",
                            "w-full"
                        )}
                        onClick={onPay}
                        disabled={loading || hasMixedParticipants || total === 0}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (isAdmin ? "Gerar Lote" : "Pagar Faturas")}
                    </Button>
                </div>
            </div>

        </div>
    );
}
