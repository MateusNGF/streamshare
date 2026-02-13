import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200",
            className
        )}>
            {Icon && (
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Icon className="w-6 h-6 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
