"use client";

import { History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LinkHistoryItem } from "./LinkHistoryItem";

interface LinkHistoryListProps {
    history: any[];
    loading: boolean;
    onRevoke: (id: string) => void;
    isPending: boolean;
}

export function LinkHistoryList({ history, loading, onRevoke, isPending }: LinkHistoryListProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (loading) {
        return <div className="animate-pulse flex justify-center py-4 text-gray-400 text-sm">Carregando histórico...</div>;
    }

    if (history.length === 0) return null;

    return (
        <div className="border-t border-gray-100 pt-6 mt-6">
            <CollapseToggleButton
                isCollapsed={isCollapsed}
                count={history.length}
                onClick={() => setIsCollapsed(!isCollapsed)}
            />

            {!isCollapsed && (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <HistoryTableHeader label="Gerado em" />
                                <HistoryTableHeader label="Expira em" />
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
            )}
        </div>
    );
}

function CollapseToggleButton({ isCollapsed, count, onClick }: any) {
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
        <th className={`px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ${className}`}>
            {label}
        </th>
    );
}
