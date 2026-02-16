"use client";

import React, { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
    children: ReactNode;
    content: string;
    isVisible?: boolean;
    position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
    children,
    content,
    isVisible,
    position = "right"
}: TooltipProps) {
    return (
        <TooltipPrimitive.Root open={isVisible}>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={position}
                    sideOffset={8}
                    className="
                        z-50 px-3 py-2 bg-gray-950 text-white 
                        text-[11px] font-semibold rounded-xl shadow-2xl border border-white/10
                        max-w-[240px] leading-relaxed
                        animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 
                        data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 
                        data-[side=top]:slide-in-from-bottom-2
                    "
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-gray-950" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}
