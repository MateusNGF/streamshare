'use client';

import { useEffect, useRef } from 'react';
import { useCurrencyStore } from '@/hooks/useCurrency';
import { CurrencyCode } from '@/types/currency.types';

interface CurrencyInitializerProps {
    currencyCode: string;
}

/**
 * Initializes the global currency store with the server-side user preference.
 * Should be placed in the Dashboard Layout to ensure currency is set for all client components.
 */
export function CurrencyInitializer({ currencyCode }: CurrencyInitializerProps) {
    const setCurrency = useCurrencyStore((state) => state.setCurrency);
    const initialized = useRef(false);



    useEffect(() => {
        if (currencyCode) {
            setCurrency(currencyCode as CurrencyCode);
        }
    }, [currencyCode, setCurrency]);

    return null;
}
