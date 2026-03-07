"use client";

import { MessageCircleQuestion, ArrowRight } from "lucide-react";

interface SupportActionCardProps {
    onClick: () => void;
    isActive: boolean;
}

export function SupportActionCard({ onClick, isActive }: SupportActionCardProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white border rounded-[1.5rem] transition-all duration-300 text-left group
                ${isActive ? "border-violet-600 shadow-md ring-2 ring-violet-500/20" : "border-gray-200 hover:border-violet-300 hover:shadow-lg"}
            `}
        >
            <div className={`p-4 rounded-2xl shrink-0 transition-all duration-300 
                ${isActive ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600 group-hover:bg-violet-100 group-hover:scale-110"}`}>
                <MessageCircleQuestion size={26} />
            </div>
            <div>
                <p className={`text-lg font-bold mb-1 transition-colors ${isActive ? "text-violet-900" : "text-gray-900"}`}>
                    Falar com um Humano
                </p>
                <p className={`text-sm ${isActive ? "text-violet-600/80" : "text-gray-500"}`}>
                    Abra um novo chamado para a equipa.
                </p>
            </div>
            <div className="hidden sm:block ml-auto bg-gray-50 p-3 rounded-full group-hover:bg-violet-50 transition-colors">
                <ArrowRight className={`transition-colors ${isActive ? "text-violet-600" : "text-gray-400 group-hover:text-violet-600"}`} />
            </div>
        </button>
    );
}
