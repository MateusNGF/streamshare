"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    className?: string;
    label?: string;
    formatValue?: (value: number) => string;
}

export function RangeSlider({
    min,
    max,
    step = 1,
    value,
    onValueChange,
    className,
    label,
    formatValue = (v) => v.toString()
}: RangeSliderProps) {
    return (
        <div className={cn("flex flex-col gap-4 py-2", className)}>
            {(label || value) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold">
                            {formatValue(value[0])}
                        </span>
                        <span className="text-gray-400 text-xs">—</span>
                        <span className="px-2 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold">
                            {formatValue(value[1])}
                        </span>
                    </div>
                </div>
            )}

            <SliderPrimitive.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={value}
                max={max}
                min={min}
                step={step}
                onValueChange={(vals) => onValueChange(vals as [number, number])}
            >
                <SliderPrimitive.Track className="bg-gray-100 relative grow rounded-full h-[6px]">
                    <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className="block w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 cursor-grab active:cursor-grabbing"
                    aria-label="Mínimo"
                />
                <SliderPrimitive.Thumb
                    className="block w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 cursor-grab active:cursor-grabbing"
                    aria-label="Máximo"
                />
            </SliderPrimitive.Root>

            <div className="flex justify-between px-1">
                <span className="text-[10px] text-gray-400 font-medium">{formatValue(min)}</span>
                <span className="text-[10px] text-gray-400 font-medium">{formatValue(max)}</span>
            </div>
        </div>
    );
}
