/**
 * Mask utilities for formatting input values
 * Provides automatic formatting for CPF, phone numbers, etc.
 */

import { removeNonNumeric } from "./validation";

/**
 * Apply CPF mask: XXX.XXX.XXX-XX
 * @param value - String to format
 * @returns Formatted CPF string
 */
export function applyCPFMask(value: string): string {
    const cleaned = removeNonNumeric(value);

    // Limit to 11 digits
    const limited = cleaned.substring(0, 11);

    // Apply mask progressively as user types
    if (limited.length <= 3) {
        return limited;
    } else if (limited.length <= 6) {
        return `${limited.substring(0, 3)}.${limited.substring(3)}`;
    } else if (limited.length <= 9) {
        return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6)}`;
    } else {
        return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6, 9)}-${limited.substring(9)}`;
    }
}

/**
 * Apply phone mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 * Automatically detects mobile (11 digits) or landline (10 digits)
 * @param value - String to format
 * @returns Formatted phone string
 */
export function applyPhoneMask(value: string): string {
    const cleaned = removeNonNumeric(value);

    // Limit to 11 digits
    const limited = cleaned.substring(0, 11);

    // Apply mask progressively
    if (limited.length <= 2) {
        return limited;
    } else if (limited.length <= 6) {
        return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
    } else if (limited.length <= 10) {
        // Landline: (XX) XXXX-XXXX
        return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`;
    } else {
        // Mobile: (XX) XXXXX-XXXX
        return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
    }
}

/**
 * Remove all mask formatting from a value
 * @param value - Masked string
 * @returns Clean string with only numbers
 */
export function removeMask(value: string): string {
    return removeNonNumeric(value);
}



/**
 * Mask types supported by the mask utilities
 */
export type MaskType = "cpf" | "phone" | "none";

/**
 * Apply mask based on type
 * @param value - String to format
 * @param maskType - Type of mask to apply
 * @returns Formatted string
 */
export function applyMask(value: string, maskType: MaskType): string {
    switch (maskType) {
        case "cpf":
            return applyCPFMask(value);
        case "phone":
            return applyPhoneMask(value);
        case "none":
        default:
            return value;
    }
}
