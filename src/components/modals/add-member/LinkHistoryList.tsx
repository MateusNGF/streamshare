"use client";

import { Clock, History, Trash2, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between w-full group mb-4"
            >
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-primary transition-colors">
                    <History size={16} />
                    <span className="text-sm font-bold uppercase tracking-wider">Histórico de Links ({history.length})</span>
                </div>
                {isCollapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
            </button>

            {!isCollapsed && (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gerado em</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((item) => {
                                const isExpired = new Date(item.expiresAt) < new Date();
                                const isRevoked = item.status === "recusado";
                                const isActive = item.status === "pendente" && !isExpired;

                                return (
                                    <tr key={item.id} className="hover:bg-white transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    às {format(new Date(item.createdAt), "HH:mm")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isActive ? (
                                                <div className="flex items-center gap-1.5 text-green-600">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[10px] font-black uppercase">Ativo</span>
                                                </div>
                                            ) : isRevoked ? (
                                                <div className="flex items-center gap-1.5 text-red-500">
                                                    <XCircle size={12} />
                                                    <span className="text-[10px] font-black uppercase">Revogado</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-500">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-black uppercase">Expirado</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isActive && (
                                                <button
                                                    onClick={() => onRevoke(item.id)}
                                                    disabled={isPending}
                                                    title="Revogar Link"
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
