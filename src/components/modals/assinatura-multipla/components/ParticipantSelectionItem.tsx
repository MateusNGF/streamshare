"use client";

import { Check, Minus, Plus } from "lucide-react";
import { ParticipanteOption } from "../types";

export function ParticipantSelectionItem({
    p,
    isSelected,
    qty,
    onToggle,
    onQuantityChange
}: {
    p: ParticipanteOption;
    isSelected: boolean;
    qty: number;
    onToggle: (id: number) => void;
    onQuantityChange: (id: number, delta: number) => void;
}) {
    return (
        <div
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all cursor-pointer border ${isSelected
                ? "bg-primary/5 border-primary/20"
                : "hover:bg-gray-50 border-transparent"
                }`}
            onClick={() => onToggle(p.id)}
        >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 ${isSelected ? "bg-primary text-white shadow-sm" : "bg-gray-200 text-gray-600"
                    }`}>
                    {p.nome.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                    <p className={`font-bold truncate text-xs sm:text-sm ${isSelected ? "text-primary" : "text-gray-700"}`}>
                        {p.nome}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {p.whatsappNumero}
                    </p>
                </div>
            </div>

            {isSelected && (
                <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => onQuantityChange(p.id, -1)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={qty <= 1}
                        title="Diminuir quantidade"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{qty}</span>
                    <button
                        type="button"
                        onClick={() => onQuantityChange(p.id, 1)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                        title="Aumentar quantidade"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}

            {isSelected && <Check size={14} className="text-primary shrink-0 animate-in zoom-in duration-200" />}
        </div>
    );
}
