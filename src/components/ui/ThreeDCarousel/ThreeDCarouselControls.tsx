import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreeDCarouselControlsProps {
    activeIndex: number;
    totalItems: number;
    onNext: () => void;
    onPrev: () => void;
    onGoToIndex: (index: number) => void;
}

export function ThreeDCarouselControls({
    activeIndex,
    totalItems,
    onNext,
    onPrev,
    onGoToIndex,
}: ThreeDCarouselControlsProps) {
    return (
        <div className="flex items-center gap-6 mt-12 z-10">
            <button
                onClick={onPrev}
                disabled={activeIndex === 0}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary disabled:opacity-40 disabled:text-gray-300 transition-all hover:bg-gray-50 active:scale-95"
                aria-label="Anterior"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Pagination dots */}
            <div className="flex gap-2">
                {Array.from({ length: totalItems }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onGoToIndex(i)}
                        className={cn(
                            "h-2.5 rounded-full transition-all duration-300",
                            i === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                        )}
                        aria-label={`Ir para slide ${i + 1}`}
                    />
                ))}
            </div>

            <button
                onClick={onNext}
                disabled={activeIndex === totalItems - 1}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary disabled:opacity-40 disabled:text-gray-300 transition-all hover:bg-gray-50 active:scale-95"
                aria-label="Próximo"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
}
