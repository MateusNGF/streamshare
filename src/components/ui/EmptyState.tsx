import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from 'react';

export type EmptyStateVariant = 'default' | 'card' | 'compact' | 'glass' | 'dashed';

export interface EmptyStateProps {
    icon?: LucideIcon | React.ElementType;
    title: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    variant?: EmptyStateVariant;
    iconClassName?: string;
    iconWrapperClassName?: string;
    animate?: boolean;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    children,
    className,
    variant = 'dashed',
    iconClassName,
    iconWrapperClassName,
    animate = true,
}: EmptyStateProps) {
    const variants = {
        default: "bg-transparent",
        card: "bg-transparent",
        compact: "bg-transparent",
        glass: "bg-transparent",
        dashed: "bg-transparent",
    };

    const paddings = {
        default: "py-8 px-4 sm:py-12 sm:px-8",
        card: "py-6 px-4 sm:py-10 sm:px-8",
        compact: "py-4 px-3 sm:py-6 sm:px-4",
        glass: "py-10 px-6 sm:py-16 sm:px-12",
        dashed: "py-8 px-4 sm:py-12 sm:px-8",
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center overflow-hidden relative",
            variants[variant],
            paddings[variant],
            animate && "animate-in fade-in zoom-in-95 duration-500",
            className
        )}>
            {Icon && (
                <div className={cn(
                    "flex items-center justify-center relative group",
                    variant === 'compact' ? "w-12 h-12 bg-white rounded-xl shadow-sm mb-4"
                        : variant === 'glass' ? "w-20 h-20 bg-gray-50/80 rounded-3xl shadow-sm mb-6"
                            : "w-12 h-12 bg-gray-50 rounded-full mb-4",
                    iconWrapperClassName
                )}>
                    {variant === 'glass' && (
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors rounded-3xl" />
                    )}
                    <Icon className={cn(
                        "text-gray-400 relative z-10 transition-transform duration-300",
                        variant === 'glass' && "group-hover:scale-110 group-hover:-rotate-3",
                        variant === 'compact' ? "w-6 h-6" : variant === 'glass' ? "w-10 h-10" : "w-6 h-6",
                        iconClassName
                    )} />
                </div>
            )}

            <h3 className={cn(
                "font-semibold text-gray-900 mb-1 tracking-tight",
                variant === 'compact' ? "text-base" : variant === 'glass' ? "text-xl sm:text-2xl font-bold mb-3" : "text-lg sm:text-xl"
            )}>
                {title}
            </h3>

            {description && (
                <div className={cn(
                    "text-gray-500",
                    variant === 'compact' ? "text-xs sm:text-sm max-w-[280px] mx-auto mb-4" : variant === 'glass' ? "text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed" : "text-sm sm:text-base max-w-sm mx-auto mb-6"
                )}>
                    {typeof description === 'string' ? <p>{description}</p> : description}
                </div>
            )}

            {(action || children) && (
                <div className="flex flex-col w-full sm:w-auto items-center justify-center gap-4 relative z-10">
                    {action}
                    {children}
                </div>
            )}
        </div>
    );
}
