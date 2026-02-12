"use client";

import { User, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalDetails } from "@/hooks/useModalDetails";

interface ParticipantSectionProps {
    participant: {
        nome: string;
        email: string | null;
        whatsappNumero: string | null;
    };
    streamingInfo?: string;
    className?: string;
}

export function ParticipantSection({ participant, streamingInfo, className }: ParticipantSectionProps) {
    const { getWhatsAppUrl } = useModalDetails();
    const whatsappUrl = getWhatsAppUrl(participant.whatsappNumero);

    return (
        <div className={cn("bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4", className)}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-primary flex-shrink-0">
                    <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Cliente</p>
                    <h3 className="font-bold text-gray-900 truncate">{participant.nome}</h3>
                    {streamingInfo && (
                        <p className="text-xs text-gray-500 truncate font-medium">
                            {streamingInfo}
                        </p>
                    )}
                    {participant.email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                            <Mail size={10} />
                            <span className="truncate">{participant.email}</span>
                        </div>
                    )}
                </div>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all shadow-sm",
                        participant.whatsappNumero
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                    title="Conversar no WhatsApp"
                >
                    <MessageCircle size={20} />
                </a>
            </div>
        </div>
    );
}
