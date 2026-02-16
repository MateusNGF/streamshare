"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { SupportModal } from "./SupportModal";

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-40 group animate-in fade-in zoom-in slide-in-from-bottom-5"
                aria-label="Suporte"
            >
                <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
            </button>

            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}

