"use client";

import { InputHTMLAttributes, useId, ChangeEvent } from "react";
import { applyMask } from "@/lib/masks";
import { removeNonNumeric } from "@/lib/validation";

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    label?: string;
    error?: string;
    maskType?: "cpf" | "phone" | "none";
    onChange?: (value: string, maskedValue: string) => void;
    onValueChange?: (value: string) => void;
}

/**
 * MaskedInput component - Custom implementation with automatic masking
 * 
 * @param maskType - Type of mask to apply ('cpf', 'phone', 'none')
 * @param onChange - Callback with both clean value and masked value
 * @param onValueChange - Alternative callback with only clean value (without mask)
 * 
 * Mask patterns:
 * - CPF: 123.456.789-00 (applied automatically as user types)
 * - Phone: (11) 98765-4321 (automatically adjusts for 10 or 11 digits)
 */
export function MaskedInput({
    label,
    error,
    className = "",
    id: providedId,
    maskType = "none",
    onChange,
    onValueChange,
    value: externalValue,
    ...props
}: MaskedInputProps) {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (maskType === "none") {
            if (onChange) {
                onChange(inputValue, inputValue);
            }
            if (onValueChange) {
                onValueChange(inputValue);
            }
            return;
        }

        // Apply mask
        const masked = applyMask(inputValue, maskType);

        // Get clean value (numbers only)
        const clean = removeNonNumeric(masked);

        // Call callbacks with both values
        if (onChange) {
            onChange(clean, masked);
        }
        if (onValueChange) {
            onValueChange(clean);
        }
    };

    // Apply mask to external value if provided
    const displayValue = externalValue !== undefined && maskType !== "none"
        ? applyMask(String(externalValue), maskType)
        : (externalValue as string);

    const inputClassName = `w-full px-4 py-3 border rounded-xl transition-smooth placeholder:text-gray-500 ${error
        ? "border-red-300 focus:border-red-500"
        : "border-gray-200 focus:border-primary"
        } ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={inputId}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? errorId : undefined}
                className={inputClassName}
                value={displayValue}
                onChange={handleChange}
                {...props}
            />
            {error && (
                <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
