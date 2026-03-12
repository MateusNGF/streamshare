import { useState, useRef, useEffect, useCallback } from 'react';

interface UseThreeDCarouselProps {
    totalItems: number;
    initialIndex?: number;
}

export function useThreeDCarousel({ totalItems, initialIndex = 0 }: UseThreeDCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleNext = useCallback(() => {
        setActiveIndex((prev) => Math.min(prev + 1, totalItems - 1));
    }, [totalItems]);

    const handlePrev = useCallback(() => {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToIndex = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    // Swipe logic
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;

        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) {
            handleNext();
        } else if (distance < -minSwipeDistance) {
            handlePrev();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    return {
        activeIndex,
        handleNext,
        handlePrev,
        goToIndex,
        touchHandlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        },
    };
}
