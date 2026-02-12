"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
    value: number | string;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}

export function QuantityInput({
    value,
    onValueChange,
    min = 1,
    max,
    step = 1,
    label,
    error,
    className,
    disabled
}: QuantityInputProps) {
    const numValue = typeof value === "string" ? parseInt(value, 10) || min : value;

    const handleDecrement = () => {
        if (numValue > min) {
            onValueChange(numValue - step);
        }
    };

    const handleIncrement = () => {
        if (max === undefined || numValue < max) {
            onValueChange(numValue + step);
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <label className="text-xs font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className={cn(
                "flex items-center justify-between p-1 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all",
                error && "border-red-300 focus-within:ring-red-500/10 focus-within:border-red-500",
                disabled && "opacity-50 cursor-not-allowed bg-gray-50"
            )}>
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || numValue <= min}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Diminuir"
                >
                    <Minus size={18} />
                </button>

                <div className="flex-1 text-center font-bold text-gray-900 text-lg">
                    {numValue}
                </div>

                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || (max !== undefined && numValue >= max)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Aumentar"
                >
                    <Plus size={18} />
                </button>
            </div>
            {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
        </div>
    );
}
