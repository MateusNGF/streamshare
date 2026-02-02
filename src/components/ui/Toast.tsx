"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
    message: string;
    variant?: ToastVariant;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

const variantStyles = {
    success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: XCircle,
        iconColor: "text-red-600",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: AlertCircle,
        iconColor: "text-amber-600",
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: Info,
        iconColor: "text-blue-600",
    },
};

export function Toast({
    message,
    variant = "info",
    onClose,
    autoClose = true,
    duration = 5000,
}: ToastProps) {
    const styles = variantStyles[variant];
    const Icon = styles.icon;

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 max-w-md w-full md:w-auto
                ${styles.bg} ${styles.border} ${styles.text}
                border rounded-xl px-4 py-3 shadow-lg
                flex items-center gap-3
                animate-in slide-in-from-top-2 fade-in duration-300
            `}
        >
            <Icon size={20} className={styles.iconColor} />
            <p className="flex-1 font-medium text-sm md:text-base">{message}</p>
            <button
                onClick={onClose}
                className="hover:opacity-70 transition-opacity"
                aria-label="Fechar notificação"
            >
                <X size={18} />
            </button>
        </div>
    );
}
