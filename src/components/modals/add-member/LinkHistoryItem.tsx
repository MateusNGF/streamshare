"use client";

import { Clock, CheckCircle2, XCircle, Hourglass, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LinkHistoryItemProps {
    item: any;
    onRevoke: (id: string) => void;
    isPending: boolean;
}

export function LinkHistoryItem({ item, onRevoke, isPending }: LinkHistoryItemProps) {
    const expiresAt = new Date(item.expiresAt);
    const createdAt = new Date(item.createdAt);
    const isExpired = expiresAt < new Date();
    const isRevoked = item.status === "recusado";
    const isActive = item.status === "pendente" && !isExpired;

    // A link is considered permanent if it expires more than 5 years from now
    const isPermanent = expiresAt.getFullYear() > new Date().getFullYear() + 5;

    // Calculate time remaining for the badge
    const timeRemaining = isActive && !isPermanent
        ? formatDistanceToNow(expiresAt, { locale: ptBR, addSuffix: false })
        : null;

    return (
        <tr className="hover:bg-white transition-colors group">
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">
                        {format(createdAt, "dd/MM", { locale: ptBR })}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        às {format(createdAt, "HH:mm")}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className={cn(
                        "text-xs font-bold",
                        isExpired ? "text-gray-400" : "text-gray-700"
                    )}>
                        {isPermanent ? "Nunca" : format(expiresAt, "dd/MM", { locale: ptBR })}
                    </span>
                    {!isPermanent && (
                        <span className="text-[10px] text-gray-400">
                            às {format(expiresAt, "HH:mm")}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <StatusBadge
                    isActive={isActive}
                    isRevoked={isRevoked}
                    isPermanent={isPermanent}
                    timeRemaining={timeRemaining}
                />
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
}

function StatusBadge({ isActive, isRevoked, isPermanent, timeRemaining }: any) {
    if (isRevoked) {
        return (
            <div className="flex items-center gap-1.5 text-red-500">
                <XCircle size={12} />
                <span className="text-[10px] font-black uppercase">Revogado</span>
            </div>
        );
    }

    if (!isActive && !isRevoked) {
        return (
            <div className="flex items-center gap-1.5 text-amber-500">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase">Expirado</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-black uppercase">Ativo</span>
            </div>
            <div className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold w-fit border",
                isPermanent
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
            )}>
                {isPermanent ? (
                    <>
                        <CheckCircle2 size={8} />
                        Permanente
                    </>
                ) : (
                    <>
                        <Hourglass size={8} />
                        Expira em {timeRemaining}
                    </>
                )}
            </div>
        </div>
    );
}
