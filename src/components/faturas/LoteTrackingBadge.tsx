"use client";

import { Clock } from "lucide-react";
import { formatMesReferencia } from "@/lib/dateUtils";

interface LoteTrackingBadgeProps {
    id: number;
    metadataJson?: any;
    expiresAt?: Date | string | null;
    referenciaMes?: string | null;
    layout?: "table" | "card";
}

export function LoteTrackingBadge({
    id,
    expiresAt,
    referenciaMes,
    layout = "table"
}: LoteTrackingBadgeProps) {
    const formattedRef = referenciaMes ? formatMesReferencia(referenciaMes) : null;
    const formattedExp = expiresAt ? new Date(expiresAt).toLocaleDateString('pt-BR') : null;

    if (layout === "card") {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 leading-tight">Lote #{id}</span>
                    {formattedRef && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter whitespace-nowrap">
                            {formattedRef}
                        </span>
                    )}
                </div>
                {expiresAt && (
                    <div className="mt-0.5">
                        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1 whitespace-nowrap w-fit">
                            <Clock size={10} /> Exp: {formattedExp}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="font-black text-gray-900 leading-tight block">
                #{id}
            </span>
            {formattedRef && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter whitespace-nowrap w-fit">
                    {formattedRef}
                </span>
            )}
            {expiresAt && (
                <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
                    <Clock size={10} /> Exp: {formattedExp}
                </span>
            )}
        </div>
    );
}
