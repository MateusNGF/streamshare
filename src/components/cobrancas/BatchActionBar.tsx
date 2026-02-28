"use client";

import { Check, MessageCircle, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatCurrency";
import { CurrencyCode } from "@/types/currency.types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BatchActionBarProps {
    count: number;
    total: number;
    currencyCode?: CurrencyCode;
    isAdmin?: boolean;
    onPay: () => void;
    onWhatsApp?: () => void;
    onClear: () => void;
    loading?: boolean;
    whatsappLoading?: boolean;
    hasMixedParticipants?: boolean;
}

/**
 * BatchActionBar - Refined with Psychological Principles & Mobile Optimization
 */
export function BatchActionBar({
    count,
    total,
    currencyCode = "BRL",
    isAdmin = true,
    onPay,
    onWhatsApp,
    onClear,
    loading = false,
    whatsappLoading = false,
    hasMixedParticipants = false
}: BatchActionBarProps) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 100, x: "-50%", opacity: 0 }}
                    animate={{ y: 0, x: "-50%", opacity: 1 }}
                    exit={{ y: 120, x: "-50%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className="fixed bottom-6 sm:bottom-10 left-1/2 z-50 w-[95%] sm:w-[98%] max-w-4xl px-1 select-none"
                >
                    <div className="relative group/bar">
                        {/* Outer Glow/Halo */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-[34px] blur-2xl opacity-40" />

                        {/* Repositioned Close Button - Ergonomic top-right */}
                        <button
                            onClick={onClear}
                            disabled={loading}
                            className="absolute -top-3 -right-3 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-zinc-700 shadow-xl transition-all active:scale-90 disabled:opacity-50"
                            title="Desmarcar tudo"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>

                        <div className="relative bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-[24px] sm:rounded-[32px] p-2 sm:p-2.5 flex items-center justify-between overflow-hidden ring-1 ring-white/[0.1]">

                            {/* Accent line at the top */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Value Section */}
                            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-5 py-0.5 sm:py-1">
                                <motion.div
                                    key={count}
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 350 }}
                                    className="relative shrink-0"
                                >
                                    <Badge variant="default" className="bg-primary hover:bg-primary font-black px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm rounded-full whitespace-nowrap shadow-lg shadow-primary/30 border border-white/10">
                                        {count}
                                    </Badge>
                                </motion.div>

                                <div className="flex flex-col min-w-0">
                                    <span className="text-[7px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] leading-none mb-0.5 sm:mb-1 opacity-70 whitespace-nowrap">
                                        TOTAL <span className="hidden xs:inline">DO LOTE</span>
                                    </span>
                                    <div className="overflow-hidden h-6 sm:h-7">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={total}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -12 }}
                                                className="text-lg sm:text-2xl font-black text-white leading-none tracking-tighter block"
                                            >
                                                {formatCurrency(total, currencyCode)}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden xs:block h-8 sm:h-10 w-[1px] bg-white/5 mx-1 sm:mx-2 shrink-0" />

                            {/* Actions Section */}
                            <div className="flex items-center gap-1.5 sm:gap-2 pr-1 sm:pr-2">

                                {isAdmin && onWhatsApp && (
                                    <Button
                                        onClick={onWhatsApp}
                                        variant="outline"
                                        className="flex items-center gap-2 rounded-xl sm:rounded-2xl border-white/10 h-10 sm:h-11 px-3 sm:px-5 bg-white/10 hover:bg-white/20 hover:border-green-500/40 text-white transition-all active:scale-95 group/wa shadow-sm"
                                        disabled={loading || whatsappLoading}
                                    >
                                        {whatsappLoading ? (
                                            <Loader2 size={18} className="animate-spin text-green-500" />
                                        ) : (
                                            <>
                                                <MessageCircle size={20} className="text-green-500 group-hover/wa:scale-110 group-hover/wa:rotate-6 transition-transform sm:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                <span className="hidden lg:inline font-bold text-sm tracking-tight">Notificar</span>
                                                <span className="hidden sm:inline lg:hidden font-bold text-sm">Notificar</span>
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    onClick={onPay}
                                    className={cn(
                                        "flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl h-10 sm:h-11 px-5 sm:px-10 shadow-2xl transition-all duration-300 group/btn relative overflow-hidden",
                                        hasMixedParticipants
                                            ? "bg-zinc-800 opacity-50 cursor-not-allowed"
                                            : loading
                                                ? "bg-zinc-800"
                                                : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary/20"
                                    )}
                                    disabled={loading || hasMixedParticipants}
                                    title={hasMixedParticipants ? "Selecione cobranças de apenas um participante" : "Pagar Lote"}
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={16} className={cn("hidden sm:block text-white/50 group-hover/btn:text-white", hasMixedParticipants && "hidden")} />
                                            <span className="font-black text-xs sm:text-sm uppercase tracking-tight">
                                                {hasMixedParticipants ? "Participantes Mistos" : "Pagar Lote"}
                                            </span>
                                            {!hasMixedParticipants && <Check size={18} className="sm:size-5 stroke-[4px]" />}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
