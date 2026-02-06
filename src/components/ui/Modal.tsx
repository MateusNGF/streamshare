"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
    const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
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
                    className={`relative bg-white rounded-t-3xl rounded-b-none sm:rounded-3xl shadow-2xl w-full min-h-[70vh] sm:min-h-0 max-h-[90vh] sm:max-h-[90vh] flex flex-col overflow-hidden 
                        animate-slide-in-from-bottom sm:animate-scale-in 
                        [animation-duration:400ms] sm:[animation-duration:300ms]
                        [animation-timing-function:cubic-bezier(0.16,1,0.3,1)] sm:[animation-timing-function:ease-out]
                        ${className || 'sm:max-w-2xl'}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <h2 id={titleId.current} className="text-xl md:text-2xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Fechar modal"
                            className="p-2 hover:bg-gray-100 rounded-full transition-all touch-manipulation hover:rotate-90 duration-300"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[calc(90vh-140px)] flex-1">
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
        </div>,
        document.body
    );
}
