import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <header className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8", className)}>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="text-gray-500 font-medium">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </header>
    );
}
