export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface ToastContextType {
    toasts: Toast[];
    showToast: (type: ToastType, message: string, duration?: number, action?: { label: string, onClick: () => void }) => void;
    hideToast: (id: string) => void;
    clearAll: () => void;
}
