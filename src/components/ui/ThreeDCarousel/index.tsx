"use client";

import React from 'react';
import { useThreeDCarousel } from './useThreeDCarousel';
import { ThreeDCarouselCard } from './ThreeDCarouselCard';
import { ThreeDCarouselControls } from './ThreeDCarouselControls';
import { cn } from '@/lib/utils';

interface ThreeDCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number, activeIndex: number) => React.ReactNode;
    className?: string;
    containerClassName?: string;
    showControls?: boolean;
    perspective?: string;
    baseSpread?: { mobile: number; desktop: number };
    offsetSpread?: { mobile: number; desktop: number };
}

export function ThreeDCarousel<T>({
    items,
    renderItem,
    className,
    containerClassName,
    showControls = true,
    perspective = "1200px",
    baseSpread = { mobile: 60, desktop: 70 },
    offsetSpread = { mobile: 25, desktop: 15 }
}: ThreeDCarouselProps<T>) {
    const {
        activeIndex,
        handleNext,
        handlePrev,
        goToIndex,
        touchHandlers,
    } = useThreeDCarousel({ totalItems: items.length });

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center relative w-full overflow-hidden pb-12",
                "transform-style-3d",
                className
            )}
            style={{
                perspective,
                '--carousel-base-spread': baseSpread.mobile,
                '--carousel-offset-spread': offsetSpread.mobile,
                '--carousel-base-spread-desktop': baseSpread.desktop,
                '--carousel-offset-spread-desktop': offsetSpread.desktop,
            } as React.CSSProperties}
        >
            {/* Carousel Container */}
            <div
                className={cn(
                    "relative w-full h-[400px] max-w-md mx-auto flex items-center justify-center transform-style-3d",
                    containerClassName
                )}
                {...touchHandlers}
            >
                {items.map((item, index) => (
                    <ThreeDCarouselCard
                        key={index}
                        index={index}
                        activeIndex={activeIndex}
                        onClick={() => goToIndex(index)}
                    >
                        {renderItem(item, index, activeIndex)}
                    </ThreeDCarouselCard>
                ))}
            </div>

            {/* Controls */}
            {showControls && (
                <ThreeDCarouselControls
                    activeIndex={activeIndex}
                    totalItems={items.length}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onGoToIndex={goToIndex}
                />
            )}

            {/* Internal styles for 3D perspective and responsive spread */}
            <style jsx global>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }

        @media (min-width: 768px) {
          .transform-style-3d {
            --carousel-base-spread: var(--carousel-base-spread-desktop);
            --carousel-offset-spread: var(--carousel-offset-spread-desktop);
          }
        }
      `}</style>
        </div>
    );
}
