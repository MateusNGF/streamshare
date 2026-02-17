"use client";

import { Clock, CheckCircle2, XCircle, Hourglass, Trash2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { LinkUtils } from "@/lib/links";

interface LinkHistoryItemData {
    id: string;
    token: string;
    expiresAt: string | Date;
    createdAt: string | Date;
    status: "pendente" | "aceito" | "recusado" | "expirado" | string;
}

interface LinkHistoryItemProps {
    item: LinkHistoryItemData;
    onRevoke: (id: string) => void;
    isPending: boolean;
}

export function LinkHistoryItem({ item, onRevoke, isPending }: LinkHistoryItemProps) {
    const [copied, setCopied] = useState(false);

    const expiresAt = new Date(item.expiresAt);
    const createdAt = new Date(item.createdAt);

    const isExpired = LinkUtils.isExpired(expiresAt);
    const isRevokedByStatus = item.status === "recusado";
    const isActive = item.status === "pendente" && !isExpired;
    const isPermanent = LinkUtils.isPermanent(expiresAt);

    const timeRemaining = isActive && !isPermanent
        ? formatDistanceToNow(expiresAt, { locale: ptBR, addSuffix: false })
        : null;

    const handleCopy = () => {
        const url = LinkUtils.getInviteUrl(item.token);
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <tr className="hover:bg-white transition-colors group">
            <DateCell
                createdAt={createdAt}
                expiresAt={expiresAt}
                isPermanent={isPermanent}
                isExpired={isExpired}
            />

            <ExpirationCell
                expiresAt={expiresAt}
                isPermanent={isPermanent}
                isExpired={isExpired}
            />

            <td className="px-4 py-3">
                <StatusBadge
                    isActive={isActive}
                    isRevoked={isRevokedByStatus}
                    isPermanent={isPermanent}
                    timeRemaining={timeRemaining}
                />
            </td>

            <ActionsCell
                isActive={isActive}
                isPending={isPending}
                copied={copied}
                onCopy={handleCopy}
                onRevoke={() => onRevoke(item.id)}
            />
        </tr>
    );
}

/**
 * Sub-components for better SRP and Readability
 */

function DateCell({ createdAt, expiresAt, isPermanent, isExpired }: {
    createdAt: Date;
    expiresAt: Date;
    isPermanent: boolean;
    isExpired: boolean;
}) {
    return (
        <td className="px-4 py-3">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                    {format(createdAt, "dd/MM", { locale: ptBR })}
                </span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    às {format(createdAt, "HH:mm")}
                </span>
                <span className={cn(
                    "text-[9px] mt-1 sm:hidden",
                    isExpired ? "text-gray-400" : "text-gray-500"
                )}>
                    Exp: {isPermanent ? "Nunca" : format(expiresAt, "dd/MM", { locale: ptBR })}
                </span>
            </div>
        </td>
    );
}

function ExpirationCell({ expiresAt, isPermanent, isExpired }: {
    expiresAt: Date;
    isPermanent: boolean;
    isExpired: boolean;
}) {
    return (
        <td className="px-4 py-3 hidden sm:table-cell">
            <div className="flex flex-col">
                <span className={cn(
                    "text-xs font-bold whitespace-nowrap",
                    isExpired ? "text-gray-400" : "text-gray-700"
                )}>
                    {isPermanent ? "Nunca" : format(expiresAt, "dd/MM", { locale: ptBR })}
                </span>
                {!isPermanent && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        às {format(expiresAt, "HH:mm")}
                    </span>
                )}
            </div>
        </td>
    );
}

function ActionsCell({ isActive, isPending, copied, onCopy, onRevoke }: {
    isActive: boolean;
    isPending: boolean;
    copied: boolean;
    onCopy: () => void;
    onRevoke: () => void;
}) {
    if (!isActive) return <td className="px-4 py-3 text-right" />;

    return (
        <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1.5 sm:gap-1">
                <button
                    onClick={onCopy}
                    title="Copiar Link"
                    className={cn(
                        "p-2 sm:p-1.5 rounded-lg transition-all",
                        copied
                            ? "text-emerald-500 bg-emerald-50 shadow-sm"
                            : "text-gray-400 hover:text-primary hover:bg-primary/5 active:scale-95"
                    )}
                >
                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={16} />}
                </button>

                <button
                    onClick={onRevoke}
                    disabled={isPending}
                    title="Revogar Link"
                    className="p-2 sm:p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 active:scale-95"
                >
                    <Trash2 size={16} className="sm:size-[14px]" />
                </button>
            </div>
        </td>
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
