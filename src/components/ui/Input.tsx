import { InputHTMLAttributes, useId, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export function Input({ label, error, icon, className = "", id: providedId, ...props }: InputProps) {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? errorId : undefined}
                    className={`w-full ${icon ? "pl-11" : "px-4"} py-3 border rounded-xl transition-smooth placeholder:text-gray-500 ${error
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-primary"
                        } ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
