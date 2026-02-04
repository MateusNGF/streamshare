/**
 * Currency System Types
 * 
 * Defines supported currencies following ISO 4217 standard
 * Each currency includes: code, symbol, name, and locale for formatting
 */

export const SUPPORTED_CURRENCIES = {
    BRL: {
        code: 'BRL',
        symbol: 'R$',
        name: 'Real Brasileiro',
        locale: 'pt-BR',
        decimals: 2,
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'Dólar Americano',
        locale: 'en-US',
        decimals: 2,
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
        decimals: 2,
    },
    ARS: {
        code: 'ARS',
        symbol: '$',
        name: 'Peso Argentino',
        locale: 'es-AR',
        decimals: 2,
    },
    BOB: {
        code: 'BOB',
        symbol: 'Bs',
        name: 'Boliviano',
        locale: 'es-BO',
        decimals: 2,
    },
    PYG: {
        code: 'PYG',
        symbol: '₲',
        name: 'Guaraní Paraguaio',
        locale: 'es-PY',
        decimals: 0, // Guaraní doesn't use decimal places
    },
    UYU: {
        code: 'UYU',
        symbol: '$U',
        name: 'Peso Uruguaio',
        locale: 'es-UY',
        decimals: 2,
    },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;
export type CurrencyInfo = typeof SUPPORTED_CURRENCIES[CurrencyCode];

/**
 * Helper to get currency info by code
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
    const validCode = (code in SUPPORTED_CURRENCIES ? code : 'BRL') as CurrencyCode;
    return SUPPORTED_CURRENCIES[validCode];
}

/**
 * Get all supported currency codes
 */
export function getSupportedCurrencyCodes(): CurrencyCode[] {
    return Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[];
}
