"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPIGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

/**
 * Container para cards de KPI com suporte a scroll horizontal no mobile
 * e layout em grid no desktop.
 */
export function KPIGrid({ children, cols = 4, className }: KPIGridProps) {
    const gridCols = {
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4",
    }[cols] || "lg:grid-cols-4";

    return (
        <div className={cn("relative group", className)}>
            <div className={cn(
                "flex overflow-x-auto md:grid md:grid-cols-2 gap-4 md:gap-6",
                "scrollbar-hide snap-x snap-mandatory items-stretch",
                "py-10 px-4 -mx-4",
                gridCols
            )}>
                {children}
            </div>
        </div>
    );
}

/**
 * Wrapper para cada item dentro do KPIGrid.
 * Garante o comportamento de snap e largura mínima no mobile.
 */
export function KPIGridItem({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={cn("min-w-[280px] md:min-w-0 snap-center flex flex-col", className)}
            style={style}
        >
            {children}
        </div>
    );
}
