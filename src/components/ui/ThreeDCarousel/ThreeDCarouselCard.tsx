import React from 'react';
import { cn } from '@/lib/utils';

interface ThreeDCarouselCardProps {
    index: number;
    activeIndex: number;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function ThreeDCarouselCard({
    index,
    activeIndex,
    onClick,
    children,
    className,
    style
}: ThreeDCarouselCardProps) {
    const isActive = index === activeIndex;
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset);

    // 3D Curvature logic
    const zIndex = 50 - absOffset;
    const scale = isActive ? 1 : 1 - (absOffset * 0.15);

    // Use CSS variables for horizontal spread, allowing responsive adjustments
    const translateX = isActive ? 0 : `calc(${sign} * (var(--carousel-base-spread, 60) * 1% + ${absOffset} * var(--carousel-offset-spread, 25) * 1%))`;
    const translateZ = isActive ? 0 : -100 * absOffset;
    const rotateY = isActive ? 0 : sign * -40; // Curves cards towards the center
    const opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.05);

    return (
        <div
            className={cn(
                "absolute w-72 h-[340px] bg-slate-50 rounded-[32px] shadow-2xl flex flex-col items-center text-center will-change-transform",
                "transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                "border border-white/50 backdrop-blur-sm pointer-events-none",
                className
            )}
            style={{
                transform: `translateX(${translateX}) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                boxShadow: isActive
                    ? '0 25px 50px -12px rgba(107, 56, 251, 0.25)'
                    : '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
                ...style
            }}
        >
            {/* Hit Target - Narrower for active card to allow clicks on side cards behind */}
            <div
                onClick={onClick}
                className={cn(
                    "absolute inset-y-0 pointer-events-auto cursor-pointer z-10",
                    isActive ? "left-16 right-16" : "inset-x-0"
                )}
                aria-hidden="true"
            />

            {/* Content Container - pointer-events-none to let clicks pass to hit target or side cards */}
            <div className="relative h-full w-full p-8 flex flex-col items-center pointer-events-none z-20">
                {/* Ensure children can be interactive if they need to be (e.g. buttons) */}
                <div className="flex flex-col items-center h-full w-full pointer-events-none [&>*]:pointer-events-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
