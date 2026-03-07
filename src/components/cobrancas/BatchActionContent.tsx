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
        <div className="max-w-[1400px] mx-auto w-full px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
                <button
                    onClick={onClear}
                    disabled={loading}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                    title="Limpar seleção"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex items-center flex-1 justify-end gap-5 sm:gap-6 pl-4 md:pl-8 border-l border-gray-100">
                <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider leading-none mb-1.5">
                        Total a pagar
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight leading-none">
                        {formatCurrency(total, currencyCode)}
                    </span>
                    {hasMixedParticipants && (
                        <span className="text-[10px] font-medium text-amber-500 mt-1.5 max-w-[140px] sm:max-w-none leading-tight">
                            Selecione apenas 1 participante
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && onWhatsApp && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="hidden sm:flex rounded-full px-6 font-semibold text-gray-600 shadow-sm shadow-gray-200/50 hover:bg-gray-50 hover:text-gray-800 transition-colors"
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
                        className="rounded-full px-6 sm:px-8 font-semibold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all"
                        onClick={onPay}
                        disabled={loading || hasMixedParticipants || total === 0}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                {isAdmin ? "Gerar Lote" : "Pagar Faturas"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
