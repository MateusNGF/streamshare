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
                    sideOffset={5}
                    className="
                        z-50 px-2 py-1 bg-gray-900 text-white 
                        text-[10px] font-medium rounded shadow-lg whitespace-nowrap
                        animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 
                        data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 
                        data-[side=top]:slide-in-from-bottom-2
                    "
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-gray-900" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}
