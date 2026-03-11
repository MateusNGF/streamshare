"use client";

import { Check } from "lucide-react";
import { ParticipanteOption, StreamingOption } from "../types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Tooltip } from "@/components/ui/Tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function ParticipantSelectionItem({
    p,
    selectedStreamings,
    participantStreamings,
    onToggleStreaming,
}: {
    p: ParticipanteOption;
    selectedStreamings: StreamingOption[];
    participantStreamings: Map<number, Set<number>>;
    onToggleStreaming: (participantId: number, streamingId: number) => void;
}) {
    const isSelected = participantStreamings.has(p.id);

    return (
        <div className={`w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl transition-all border ${isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-gray-50 border-gray-100 bg-white"}`}>
            <div className="flex items-center gap-3 mb-3 sm:mb-0 overflow-hidden">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${isSelected ? "bg-primary text-white shadow-sm" : "bg-gray-200 text-gray-600"
                    }`}>
                    {p.nome.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                    <p className={`font-bold truncate text-sm ${isSelected ? "text-primary" : "text-gray-700"}`}>
                        {p.nome}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {p.whatsappNumero}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                {selectedStreamings.map(s => {
                    const set = participantStreamings.get(p.id);
                    const hasStreaming = set ? set.has(s.id) : false;

                    // calculate available slots dynamically
                    let used = 0;
                    participantStreamings.forEach(subs => { if (subs.has(s.id)) used++; });
                    const available = (s.limiteParticipantes - s.ocupados) - used;
                    const canAdd = hasStreaming || available > 0;

                    const token = (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canAdd || hasStreaming) onToggleStreaming(p.id, s.id);
                            }}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border-2 ${hasStreaming
                                ? "border-primary shadow-md scale-105"
                                : canAdd
                                    ? "border-transparent opacity-50 hover:opacity-100 hover:scale-105 hover:bg-white hover:shadow-sm"
                                    : "border-transparent opacity-20 grayscale cursor-not-allowed bg-gray-100"
                                }`}
                        >
                            <StreamingLogo name={s.nome} color={s.cor} iconeUrl={s.iconeUrl} size="sm" rounded="lg" />
                            {hasStreaming && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-in zoom-in shadow-sm">
                                    <Check size={10} className="text-white" strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    );

                    if (!canAdd && !hasStreaming) {
                        return (
                            <TooltipPrimitive.Provider key={s.id}>
                                <Tooltip content={`Vagas esgotadas para ${s.nome}`}>
                                    <div>{token}</div>
                                </Tooltip>
                            </TooltipPrimitive.Provider>
                        );
                    }

                    return <div key={s.id}>{token}</div>;
                })}
            </div>
        </div>
    );
}
