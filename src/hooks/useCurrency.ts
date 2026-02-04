'use client';

/**
 * Currency Hook
 * 
 * Provides access to the user's preferred currency
 * Uses Zustand for global state management
 */

import { create } from 'zustand';
import { CurrencyCode, getCurrencyInfo } from '@/types/currency.types';
import { formatCurrency } from '@/lib/formatCurrency';

interface CurrencyStore {
    currencyCode: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
}

/**
 * Zustand store for currency state
 */
export const useCurrencyStore = create<CurrencyStore>((set) => ({
    currencyCode: 'BRL',
    setCurrency: (code) => set({ currencyCode: code }),
}));

/**
 * Hook to access currency information and formatting
 * 
 * @returns Currency code, setter, info, and format function
 * 
 * @example
 * const { currencyCode, format, setCurrency } = useCurrency();
 * format(1234.56) // "R$ 1.234,56"
 * setCurrency('USD')
 */
export function useCurrency() {
    const { currencyCode, setCurrency } = useCurrencyStore();
    const currencyInfo = getCurrencyInfo(currencyCode);

    /**
     * Format a value using the current currency
     */
    const format = (value: number | string | null | undefined) => {
        return formatCurrency(value, currencyCode);
    };

    return {
        currencyCode,
        currencyInfo,
        setCurrency,
        format,
    };
}
