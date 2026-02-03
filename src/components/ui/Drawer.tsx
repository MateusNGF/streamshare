"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { FocusTrap } from "focus-trap-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    side?: "right" | "bottom"; // Future proofing, usually right for filters
}

export function Drawer({ isOpen, onClose, title, children, footer, side = "right" }: DrawerProps) {
    const titleId = useRef(`drawer-title-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sideClasses = side === "right"
        ? "inset-y-0 right-0 h-full w-full sm:w-[400px] border-l rounded-l-2xl slide-in-from-right-full"
        : "inset-x-0 bottom-0 h-[90vh] w-full border-t rounded-t-2xl slide-in-from-bottom-full";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <FocusTrap
                focusTrapOptions={{
                    initialFocus: false,
                    allowOutsideClick: true,
                    escapeDeactivates: false,
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId.current}
                    className={cn(
                        "relative bg-white shadow-2xl flex flex-col overflow-hidden animate-in duration-300 ease-in-out",
                        sideClasses
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <h2 id={titleId.current} className="text-xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Fechar"
                            className="p-2 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50">
                            {footer}
                        </div>
                    )}
                </div>
            </FocusTrap>
        </div>
    );
}
