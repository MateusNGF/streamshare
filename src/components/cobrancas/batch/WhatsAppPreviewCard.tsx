"use client";

import { MessageCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface WhatsAppPreviewCardProps {
    message: string;
}

export function WhatsAppPreviewCard({ message }: WhatsAppPreviewCardProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Preview WhatsApp
                </h3>
                <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 text-[9px] font-black">
                    MENSAGEM AUTOMÁTICA
                </Badge>
            </div>
            <div className="bg-green-50/30 rounded-2xl border border-green-100 p-4 relative overflow-hidden group">
                <MessageCircle size={60} className="absolute -right-4 -bottom-4 text-green-100/50 -rotate-12 transition-transform group-hover:scale-110 duration-500" />
                <pre className="text-xs text-green-900 font-medium leading-relaxed whitespace-pre-wrap relative z-10">
                    {message}
                </pre>
            </div>
            <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                <Info size={10} />
                O sistema enviará o link do PIX automaticamente após a confirmação.
            </p>
        </div>
    );
}
