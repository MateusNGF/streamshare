import React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-primary text-white hover:bg-primary/80 border-transparent",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80 border-transparent",
            destructive: "bg-red-500 text-white hover:bg-red-500/80 border-transparent",
            outline: "text-gray-950 border-gray-200",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
