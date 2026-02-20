import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    rightElement?: ReactNode;
    className?: string;
}

export function SectionHeader({ title, description, rightElement, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-row py-3  sm:items-center justify-between gap-4 mb-6", className)}>
            <div className="flex items-start gap-3">
                <div className="w-1.5 h-7 bg-primary rounded-full shrink-0" />
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-7">{title}</h2>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
            </div>
            {rightElement && (
                <div className="flex items-center gap-2">
                    {rightElement}
                </div>
            )}
        </div>
    );
} 
