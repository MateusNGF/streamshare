"use client";

import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return {
        success: (message: string, duration?: number, action?: { label: string, onClick: () => void }) => context.showToast('success', message, duration, action),
        error: (message: string, duration?: number, action?: { label: string, onClick: () => void }) => context.showToast('error', message, duration, action),
        warning: (message: string, duration?: number, action?: { label: string, onClick: () => void }) => context.showToast('warning', message, duration, action),
        info: (message: string, duration?: number, action?: { label: string, onClick: () => void }) => context.showToast('info', message, duration, action),
        hide: context.hideToast,
        clearAll: context.clearAll,
    };
}
