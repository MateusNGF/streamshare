import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "primary" | "white" | "gray";
    className?: string;
}

export function Spinner({ size = "md", color = "primary", className }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-3",
        xl: "w-12 h-12 border-4",
    };

    const colorClasses = {
        primary: "border-primary border-t-transparent",
        white: "border-white border-t-transparent",
        gray: "border-gray-400 border-t-transparent",
    };

    return (
        <div
            className={cn(
                "rounded-full animate-spin",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            role="status"
            aria-label="Carregando..."
        >
            <span className="sr-only">Carregando...</span>
        </div>
    );
}
