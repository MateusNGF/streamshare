"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Sub-components
import { BatchSummaryDrawer } from "./BatchSummaryDrawer";
import { BatchActionContent } from "./BatchActionContent";
import { CurrencyCode } from "@/types/currency.types";
import { Loader2 } from "lucide-react";

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
    summaryItems?: {
        id: string | number;
        title: string;
        description?: string;
        value: number;
        icon?: React.ReactNode;
    }[];
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
    hasMixedParticipants = false,
    summaryItems = []
}: BatchActionBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <AnimatePresence>
            {count > 0 && (
                <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-[100] pointer-events-none flex justify-center">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="pointer-events-auto w-full bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none flex flex-col"
                    >
                        {/* Expandable Summary Drawer */}
                        {summaryItems.length > 0 && (
                            <BatchSummaryDrawer
                                isExpanded={isExpanded}
                                summaryItems={summaryItems}
                                currencyCode={currencyCode}
                                onToggleExpand={() => setIsExpanded(!isExpanded)}
                                count={count}
                            />
                        )}

                        <BatchActionContent
                            total={total}
                            currencyCode={currencyCode}
                            isAdmin={isAdmin}
                            onPay={onPay}
                            onWhatsApp={onWhatsApp}
                            onClear={onClear}
                            loading={loading}
                            whatsappLoading={whatsappLoading}
                            hasMixedParticipants={hasMixedParticipants}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}