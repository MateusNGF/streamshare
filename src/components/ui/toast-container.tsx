"use client";

import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';
import { ToastItem } from './toast-item';

export function ToastContainer() {
    const context = useContext(ToastContext);

    if (!context) {
        return null;
    }

    const { toasts, hideToast } = context;

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onClose={hideToast} />
                </div>
            ))}
        </div>
    );
}
