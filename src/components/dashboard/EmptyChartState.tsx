"use client";

import { LucideIcon, PieChart, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyChartStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyChartState({
    icon: Icon = PieChart,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}: EmptyChartStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/30 animate-fade-in ${className}`}>
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Icon size={32} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-xs text-gray-500 max-w-[200px] mb-6">{description}</p>

            {actionLabel && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAction}
                    className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5 px-4"
                >
                    <Plus size={14} />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
