"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function StepIndicator({
    currentStep,
    totalSteps,
    className
}: StepIndicatorProps) {
    return (
        <div className={cn(
            "mb-8 flex flex-row justify-center mx-auto sm:max-w-md max-w-xs items-center gap-4",
            className
        )}>
            {Array.from({ length: totalSteps }, (_, i) => {
                const stepNum = i + 1;
                const isActive = currentStep === stepNum;
                const isDone = currentStep > stepNum;

                return (
                    <React.Fragment key={stepNum}>
                        {i > 0 && <div className="h-px bg-gray-100 flex-1" />}
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300",
                            isActive && "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20",
                            isDone && "bg-green-100 border-green-200 text-green-600",
                            !isActive && !isDone && "bg-gray-50 border-gray-200 text-gray-400"
                        )}>
                            {isDone ? "✓" : stepNum}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
