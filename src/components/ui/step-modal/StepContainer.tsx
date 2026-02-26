"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepContainerProps {
    step: number;
    // The relative orientation of the step (e.g. 1 is left, 2+ is right)
    // Most modals only have 2 steps, so step 1 is left, step 2 is right.
    // If you have more, you can pass 'left' or 'right' explicitly if needed.
    direction?: "left" | "right";
    children: React.ReactNode;
    className?: string;
}

export function StepContainer({
    step,
    direction,
    children,
    className
}: StepContainerProps) {
    // Default logic: step 1 enters from left, step 2+ enters from right
    const finalDirection = direction || (step === 1 ? "left" : "right");

    return (
        <div className={cn(
            "animate-in fade-in duration-500 w-full",
            finalDirection === "left" ? "slide-in-from-left-4" : "slide-in-from-right-4",
            className
        )}>
            {children}
        </div>
    );
}
