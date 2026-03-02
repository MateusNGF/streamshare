"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export function StepHeader({
    title,
    description,
    className
}: StepHeaderProps) {
    return (
        <div className={cn("text-center mb-6", className)}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                    {description}
                </p>
            )}
        </div>
    );
}
