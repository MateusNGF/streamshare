"use client";

import { createContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType, ToastContextType } from '@/types/toast';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
        // Deduplication: Check if a toast with the same message already exists
        setToasts((prev) => {
            const exists = prev.some(t => t.message === message && t.type === type);
            if (exists) return prev;

            const id = Math.random().toString(36).substring(2, 9);
            const newToast: Toast = { id, type, message, duration };



            return [...prev, newToast];
        });
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAll }}>
            {children}
        </ToastContext.Provider>
    );
}
