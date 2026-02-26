"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIconProps {
    icon: LucideIcon;
    variant?: "primary" | "success" | "warning" | "danger";
    className?: string;
}

export function StepIcon({
    icon: Icon,
    variant = "primary",
    className
}: StepIconProps) {
    const variants = {
        primary: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-600",
        warning: "bg-amber-100 text-amber-600",
        danger: "bg-red-100 text-red-600",
    };

    return (
        <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner transition-colors duration-300",
            variants[variant],
            className
        )}>
            <Icon size={40} />
        </div>
    );
}
