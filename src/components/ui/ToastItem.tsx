"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast, ToastType } from '@/types/toast';

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; bgColor: string; borderColor: string; iconColor: string; textColor: string }> = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        textColor: 'text-red-900',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-500',
        textColor: 'text-amber-900',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-900',
    },
};

export function ToastItem({ toast, onClose }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const config = toastConfig[toast.type];
    const Icon = config.icon;

    useEffect(() => {
        // Delay para trigger da animação de entrada
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300); // Duração da animação de saída
    };

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-2xl border shadow-lg
        min-w-[320px] max-w-md
        transition-all duration-300 ease-out
        ${config.bgColor} ${config.borderColor}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <Icon className={`flex-shrink-0 w-5 h-5 mt-0.5 ${config.iconColor}`} />

            <div className="flex-1 space-y-1">
                <p className={`text-sm font-medium ${config.textColor}`}>
                    {toast.message}
                </p>
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick();
                            handleClose();
                        }}
                        className={`text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity ${config.textColor}`}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors ${config.textColor}`}
                aria-label="Fechar notificação"
            >
                <X size={16} />
            </button>
        </div>
    );
}
