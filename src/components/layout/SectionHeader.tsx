import { ReactNode } from "react";

interface SectionHeaderProps {
    title: string;
    description?: string;
    rightElement?: ReactNode;
}

export function SectionHeader({ title, description, rightElement }: SectionHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {rightElement && (
                <div className="flex items-center gap-3">
                    {rightElement}
                </div>
            )}
        </div>
    );
} 
