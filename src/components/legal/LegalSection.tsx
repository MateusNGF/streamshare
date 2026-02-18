"use client";

import { ReactNode } from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { cn } from "@/lib/utils";

interface LegalSectionProps {
    id: string;
    index?: string;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    isHighlighted?: boolean;
}

export function LegalSection({
    id,
    index,
    title,
    description,
    children,
    className,
    isHighlighted = false
}: LegalSectionProps) {
    const displayTitle = index ? `${index}. ${title}` : title;

    return (
        <section
            id={id}
            className={cn(
                "scroll-mt-24",
                isHighlighted && "bg-primary/[0.02] border-y border-primary/5 py-12 px-6 rounded-3xl",
                className
            )}
        >
            <SectionHeader
                title={displayTitle}
                description={description}
                className="mb-8"
            />
            <div className="prose prose-gray max-w-none text-gray-700 leading-loose text-justify">
                {children}
            </div>
        </section>
    );
}
