"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogHeaderProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogFooterProps {
    className?: string;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </div>
    );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className = "", children }, ref) => {
        return (
            <div
                ref={ref}
                className={`relative z-50 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto ${className}`}
            >
                {children}
            </div>
        );
    }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className = "", children }: DialogHeaderProps) => {
    return (
        <div className={`flex flex-col space-y-1.5 mb-4 ${className}`}>
            {children}
        </div>
    );
};

const DialogTitle = ({ className = "", children }: DialogTitleProps) => {
    return (
        <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>
            {children}
        </h2>
    );
};

const DialogFooter = ({ className = "", children }: DialogFooterProps) => {
    return (
        <div className={`flex items-center justify-end gap-3 mt-6 ${className}`}>
            {children}
        </div>
    );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
