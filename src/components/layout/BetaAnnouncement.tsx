"use client";

import { useState, useEffect } from "react";
import { BetaDetailsModal } from "@/components/modals/BetaDetailsModal";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "streamshare_beta_banner_dismissed_v1";

export function BetaAnnouncement() {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        // localStorage.setItem(STORAGE_KEY, "true");
    };

    const handleOpenDetails = () => {
        setIsModalOpen(true);
    };

    if (!isVisible && !isModalOpen) return null;

    return (
        <>
            {isVisible && (
                <button
                    onClick={handleOpenDetails}
                    className="fixed bottom-6 left-6 z-50 flex items-center gap-3 pr-4 pl-1 py-1 bg-slate-950/80 hover:bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/20 rounded-full transition-all duration-300 group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-5"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-[10px] shadow-lg shadow-violet-500/30">
                        BETA
                    </div>

                    <div className="flex flex-col items-start mr-2">
                        <span className="text-xs font-bold text-white">Versão v0.1.0</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-violet-300 transition-colors">Saiba mais &rarr;</span>
                    </div>

                    <div
                        onClick={handleDismiss}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors ml-1"
                        role="button"
                        aria-label="Fechar aviso"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </button>
            )}

            <BetaDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
