/**
 * Currency Formatting Utilities
 * 
 * Uses Intl.NumberFormat for proper internationalization
 * Handles Brazilian Real (BRL), US Dollar (USD), and Euro (EUR)
 */

import { SUPPORTED_CURRENCIES, CurrencyCode, getCurrencyInfo } from '@/types/currency.types';

/**
 * Format a numeric value as currency
 * 
 * @param value - Numeric value to format (number, string, or Decimal)
 * @param currencyCode - ISO 4217 currency code (default: BRL)
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 * 
 * @example
 * formatCurrency(1234.56, 'BRL') // "R$ 1.234,56"
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency('1234.56', 'EUR') // "1.234,56 €"
 */
export function formatCurrency(
    value: number | string | null | undefined,
    currencyCode: CurrencyCode = 'BRL'
): string {
    // Convert to number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value ?? 0;

    // Handle invalid numbers
    if (isNaN(numericValue)) {
        const currency = getCurrencyInfo(currencyCode);
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
        }).format(0);
    }

    // Get currency info
    const currency = getCurrencyInfo(currencyCode);

    // Format using Intl.NumberFormat
    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);
}

/**
 * Parse a formatted currency string back to number
 * 
 * @param value - Formatted currency string
 * @returns Numeric value
 * 
 * @example
 * parseCurrency('R$ 1.234,56') // 1234.56
 * parseCurrency('$1,234.56') // 1234.56
 */
export function parseCurrency(value: string): number {
    // Remove all non-numeric characters except dots and commas
    const cleaned = value.replace(/[^\d,.-]/g, '');

    // Replace comma with dot for parsing (handle both formats)
    const normalized = cleaned.replace(',', '.');

    return parseFloat(normalized) || 0;
}

/**
 * Format currency for display in compact form (K, M, B)
 * 
 * @param value - Numeric value to format
 * @param currencyCode - ISO 4217 currency code
 * @returns Compact formatted string (e.g., "R$ 1,2K")
 */
export function formatCurrencyCompact(
    value: number | string,
    currencyCode: CurrencyCode = 'BRL'
): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) return formatCurrency(0, currencyCode);

    const currency = getCurrencyInfo(currencyCode);

    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(numericValue);
}
