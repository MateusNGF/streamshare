"use client";

import { History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LinkHistoryItem } from "./LinkHistoryItem";
import { cn } from "@/lib/utils";

interface LinkHistoryListProps {
    history: any[]; // Ideally should be Convite[] from Prisma or similar
    loading: boolean;
    onRevoke: (id: string) => void;
    isPending: boolean;
}

export function LinkHistoryList({ history, loading, onRevoke, isPending }: LinkHistoryListProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (loading) {
        return <LoadingState />;
    }

    if (history.length === 0) return null;

    return (
        <div className="border-t border-gray-100 pt-6 mt-6">
            <CollapseToggleButton
                isCollapsed={isCollapsed}
                count={history.length}
                onClick={() => setIsCollapsed(prev => !prev)}
            />

            {!isCollapsed && (
                <HistoryTable
                    history={history}
                    onRevoke={onRevoke}
                    isPending={isPending}
                />
            )}
        </div>
    );
}

/**
 * Sub-components
 */

function LoadingState() {
    return <div className="animate-pulse flex justify-center py-4 text-gray-400 text-sm">Carregando histórico...</div>;
}

function HistoryTable({ history, onRevoke, isPending }: Omit<LinkHistoryListProps, 'loading'>) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[300px]">
                    <thead>
                        <tr className="bg-gray-100/50">
                            <HistoryTableHeader label="Gerado" />
                            <HistoryTableHeader label="Expira" className="hidden sm:table-cell" />
                            <HistoryTableHeader label="Status" />
                            <HistoryTableHeader label="Ações" className="text-right" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((item) => (
                            <LinkHistoryItem
                                key={item.id}
                                item={item}
                                onRevoke={onRevoke}
                                isPending={isPending}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CollapseToggleButton({ isCollapsed, count, onClick }: { isCollapsed: boolean; count: number; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full group mb-4"
        >
            <div className="flex items-center gap-2 text-gray-500 group-hover:text-primary transition-colors">
                <History size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Histórico de Links ({count})</span>
            </div>
            {isCollapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
        </button>
    );
}

function HistoryTableHeader({ label, className }: { label: string; className?: string }) {
    return (
        <th className={cn(
            "px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest",
            className
        )}>
            {label}
        </th>
    );
}
