"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { FocusTrap } from "focus-trap-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
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
                    className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <h2 id={titleId.current} className="text-xl md:text-2xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Fechar modal"
                            className="p-2 hover:bg-gray-100 rounded-full transition-all touch-manipulation"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-100 bg-gray-50">
                            {footer}
                        </div>
                    )}
                </div>
            </FocusTrap>
        </div>
    );
}
