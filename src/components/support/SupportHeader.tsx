"use client";

import { MessageCircleQuestion } from "lucide-react";

export function SupportHeader() {
    return (
        <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex gap-3 text-violet-900">
            <div className="bg-violet-100 p-2 rounded-xl h-fit">
                <MessageCircleQuestion size={20} className="text-primary" />
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-1">Como podemos ajudar?</h4>
                <p className="text-sm text-violet-700/80 leading-relaxed">
                    Encontrou um problema ou tem uma sugestão? Preencha os campos abaixo.
                </p>
            </div>
        </div>
    );
}
