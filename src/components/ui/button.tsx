import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all touch-manipulation disabled:opacity-50 disabled:pointer-events-none";

        const variantStyles = {
            default: "bg-primary hover:bg-accent text-white shadow-lg shadow-primary/25",
            secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
            outline: "border border-gray-200 hover:bg-gray-50 text-gray-700",
            ghost: "hover:bg-gray-100 text-gray-700",
            destructive: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25",
        };

        const sizeStyles = {
            default: "px-6 py-3 rounded-2xl",
            sm: "px-4 py-2 rounded-xl text-sm",
            lg: "px-8 py-4 rounded-2xl text-lg",
            icon: "p-2 rounded-xl",
        };

        const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

        return <button className={combinedClassName} ref={ref} {...props} />;
    }
);

Button.displayName = "Button";

export { Button };
