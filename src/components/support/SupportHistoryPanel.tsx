"use client";

import { Activity } from "lucide-react";
import { TicketHistoryTable } from "@/components/support/TicketHistoryTable";

interface SupportHistoryPanelProps {
    onTicketClick: (ticket: any) => void;
    activeTicketId?: string;
}

export function SupportHistoryPanel({ onTicketClick, activeTicketId }: SupportHistoryPanelProps) {
    return (
        <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col sticky top-6 max-h-[calc(100vh-280px)]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Activity size={18} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Histórico de Chamados</h3>
                </div>
            </div>
            <div className="p-1 flex-1 overflow-auto bg-gray-50/20">
                <TicketHistoryTable
                    onTicketClick={onTicketClick}
                    activeTicketId={activeTicketId}
                />
            </div>
        </div>
    );
}
