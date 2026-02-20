'use client';

/**
 * PercentageInput Component
 * 
 * Specialized input for percentage values with:
 * - Automatic formatting with % suffix
 * - Compatible with react-hook-form
 * - Full accessibility (A11y)
 * - StreamShare Design System styling
 */

import { useId, forwardRef } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface PercentageInputProps extends Omit<NumericFormatProps, 'onValueChange'> {
    label?: string;
    error?: string;
    onValueChange?: (value: number | undefined) => void;
    required?: boolean;
    className?: string;
    id?: string;
}

export const PercentageInput = forwardRef<HTMLInputElement, PercentageInputProps>(
    (
        {
            label,
            error,
            className = '',
            id: providedId,
            onValueChange,
            required,
            disabled,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = providedId || generatedId;
        const errorId = `${inputId}-error`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <NumericFormat
                    id={inputId}
                    getInputRef={ref}
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    suffix=" %"
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    isAllowed={(values) => {
                        const { floatValue } = values;
                        return floatValue === undefined || (floatValue >= 0 && floatValue <= 100);
                    }}
                    onValueChange={(values) => {
                        onValueChange?.(values.floatValue);
                    }}
                    disabled={disabled}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? errorId : undefined}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all placeholder:text-gray-500 ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-primary'
                        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
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
);

PercentageInput.displayName = 'PercentageInput';
