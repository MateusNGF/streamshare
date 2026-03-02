import { useId, forwardRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
    value: number | string;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    required?: boolean;
}

export const QuantityInput = forwardRef<HTMLDivElement, QuantityInputProps>(
    (
        {
            value,
            onValueChange,
            min = 1,
            max,
            step = 1,
            label,
            error,
            className,
            disabled,
            id: providedId,
            required,
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = providedId || generatedId;
        const errorId = `${inputId}-error`;

        const numValue = typeof value === "string" ? parseInt(value, 10) || min : value;

        const handleDecrement = () => {
            if (numValue > min) {
                onValueChange(numValue - step);
            }
        };

        const handleIncrement = () => {
            if (max === undefined || numValue < max) {
                onValueChange(numValue + step);
            }
        };

        return (
            <div className={cn("w-full", className)} ref={ref}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div
                    id={inputId}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? errorId : undefined}
                    className={cn(
                        "flex items-center justify-between py-2 border rounded-xl bg-white transition-smooth",
                        error
                            ? "border-red-300 focus-within:border-red-500"
                            : "border-gray-200 focus-within:border-primary",
                        disabled && "opacity-50 cursor-not-allowed bg-gray-50"
                    )}
                >
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={disabled || numValue <= min}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Diminuir"
                    >
                        <Minus size={18} />
                    </button>

                    <div className="flex-1 text-center font-bold text-gray-900 text-lg select-none">
                        {numValue}
                    </div>

                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={disabled || (max !== undefined && numValue >= max)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Aumentar"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                {error && (
                    <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

QuantityInput.displayName = "QuantityInput";
