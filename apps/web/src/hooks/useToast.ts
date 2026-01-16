"use client";

import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return {
        success: (message: string, duration?: number) => context.showToast('success', message, duration),
        error: (message: string, duration?: number) => context.showToast('error', message, duration),
        warning: (message: string, duration?: number) => context.showToast('warning', message, duration),
        info: (message: string, duration?: number) => context.showToast('info', message, duration),
        hide: context.hideToast,
        clearAll: context.clearAll,
    };
}
