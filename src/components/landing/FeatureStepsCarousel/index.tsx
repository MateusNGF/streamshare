"use client";

import React from 'react';
import { ThreeDCarousel } from '@/components/ui/ThreeDCarousel';
import { cn } from '@/lib/utils';

interface StepItem {
    id: number;
    title: string;
    description: string;
    [key: string]: any;
}

interface FeatureStepsCarouselProps {
    title: string;
    description: string;
    items: StepItem[];
    id?: string;
    className?: string;
}

export function FeatureStepsCarousel({
    title,
    description,
    items,
    id = "steps-carousel",
    className
}: FeatureStepsCarouselProps) {
    return (
        <section id={id} className={cn("py-16 md:py-24 bg-gray-50 border-y border-gray-200/50 relative w-full overflow-hidden", className)}>

            {/* Section Title */}
            <div className="text-center px-6 z-10 mb-12">
                <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-600 text-sm md:text-xl max-w-xs md:max-w-2xl mx-auto">
                    {description}
                </p>
            </div>

            <ThreeDCarousel
                items={items}
                renderItem={(step, index, activeIndex) => {
                    const isActive = index === activeIndex;
                    return (
                        <>
                            {/* Floating Number/ID Badge */}
                            <div className="w-20 h-20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl flex items-center justify-center mb-8 -mt-16 transform transition-transform hover:scale-110">
                                <span className="text-4xl font-black text-primary">{step.id}</span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                {step.title}
                            </h3>

                            <p className="text-gray-500 text-[15px] leading-relaxed font-medium">
                                {step.description}
                            </p>

                            {/* Active Indicator Line */}
                            <div
                                className={cn(
                                    "mt-auto w-12 h-1.5 rounded-full transition-colors duration-500",
                                    isActive ? "bg-primary" : "bg-gray-200"
                                )}
                            />
                        </>
                    );
                }}
            />
        </section>
    );
}
