"use client";

import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { CurrencyCode } from "@/types/currency.types";

interface BatchActionContentProps {
    total: number;
    currencyCode: CurrencyCode;
    isAdmin: boolean;
    onPay: () => void;
    onWhatsApp?: () => void;
    onClear: () => void;
    loading: boolean;
    whatsappLoading: boolean;
    hasMixedParticipants: boolean;
}

export function BatchActionContent({
    total,
    currencyCode,
    isAdmin,
    onPay,
    onWhatsApp,
    onClear,
    loading,
    whatsappLoading,
    hasMixedParticipants
}: BatchActionContentProps) {
    return (
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
                <button
                    onClick={onClear}
                    disabled={loading}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                    title="Limpar seleção"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-4 md:pl-8 border-l border-gray-100 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex flex-col items-start sm:items-end">
                    <span className="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">
                        Total a Pagar
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                        {formatCurrency(total, currencyCode)}
                    </span>
                    {hasMixedParticipants && (
                        <span className="text-[10px] font-bold text-amber-500 mt-1 max-w-[120px] sm:max-w-none text-left sm:text-right leading-tight">
                            Selecione apenas 1 participante
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && onWhatsApp && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="hidden sm:flex rounded-full px-6 font-bold shadow-sm shadow-gray-200/50"
                            onClick={onWhatsApp}
                            disabled={loading || whatsappLoading || hasMixedParticipants || total === 0}
                        >
                            {whatsappLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "WhatsApp"
                            )}
                        </Button>
                    )}
                    <Button
                        size="lg"
                        className="rounded-full px-6 sm:px-8 font-black shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
                        onClick={onPay}
                        disabled={loading || hasMixedParticipants || total === 0}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                {isAdmin ? "Gerar Lote" : "Pagar Faturas"}
                                <Sparkles size={16} className="ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
