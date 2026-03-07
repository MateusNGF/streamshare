"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/formatCurrency";
import { CurrencyCode } from "@/types/currency.types";
import { ChevronUp, ChevronDown } from "lucide-react";

interface BatchSummaryDrawerProps {
    isExpanded: boolean;
    summaryItems: {
        id: string | number;
        title: string;
        description?: string;
        value: number;
        icon?: React.ReactNode;
    }[];
    currencyCode: CurrencyCode;
    onToggleExpand: () => void;
    count: number;
}

export function BatchSummaryDrawer({
    isExpanded,
    summaryItems,
    currencyCode,
    onToggleExpand,
    count
}: BatchSummaryDrawerProps) {
    if (summaryItems.length === 0) return null;

    return (
        <>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-gray-100 bg-gray-50/50 overflow-hidden"
                    >
                        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-700">Resumo da Seleção</h4>
                                <span className="text-xs font-medium text-gray-500">{summaryItems.length} itens</span>
                            </div>
                            <div className="space-y-2">
                                {summaryItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-colors hover:border-primary/20">
                                        <div className="flex items-center gap-3">
                                            {item.icon && (
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 shrink-0 border border-gray-100">
                                                    {item.icon}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">{item.title}</span>
                                                {item.description && (
                                                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{item.description}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {formatCurrency(item.value, currencyCode)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={onToggleExpand}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-b border-gray-100/50 hover:bg-gray-50 transition-colors"
            >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resumo da Seleção ({count})
                </span>
                {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
            </button>
        </>
    );
}
