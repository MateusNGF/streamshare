"use client";

import { LucideIcon, PieChart, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface EmptyChartStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyChartState({
    icon = PieChart,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}: EmptyChartStateProps) {
    const ActionNode = actionLabel ? (
        <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5 px-4"
        >
            <Plus size={14} />
            {actionLabel}
        </Button>
    ) : undefined;

    return (
        <EmptyState
            icon={icon}
            title={title}
            description={description}
            action={ActionNode}
            variant="compact"
            className={`h-full min-h-[300px] bg-transparent justify-center ${className}`}
            iconWrapperClassName="bg-white p-4 rounded-full shadow-sm w-16 h-16"
            iconClassName="w-8 h-8 text-gray-300"
        />
    );
}
