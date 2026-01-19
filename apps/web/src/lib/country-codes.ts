/**
 * Country codes configuration for international phone numbers
 * Supports E.164 format phone numbers
 */

export interface CountryCode {
    code: string;          // ISO 3166-1 alpha-2 (BR, US, etc)
    dialCode: string;      // +55, +1, etc
    name: string;          // Country name in Portuguese
    flag: string;          // Flag emoji
    mask?: string;         // Optional phone mask
    minLength?: number;    // Minimum phone length (without country code)
    maxLength?: number;    // Maximum phone length (without country code)
}

export const COUNTRY_CODES: CountryCode[] = [
    {
        code: 'BR',
        dialCode: '+55',
        name: 'Brasil',
        flag: '🇧🇷',
        mask: '(99) 99999-9999',
        minLength: 10,
        maxLength: 11,
    },
    {
        code: 'US',
        dialCode: '+1',
        name: 'Estados Unidos',
        flag: '🇺🇸',
        mask: '(999) 999-9999',
        minLength: 10,
        maxLength: 10,
    },
    {
        code: 'PT',
        dialCode: '+351',
        name: 'Portugal',
        flag: '🇵🇹',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'AR',
        dialCode: '+54',
        name: 'Argentina',
        flag: '🇦🇷',
        minLength: 10,
        maxLength: 11,
    },
    {
        code: 'MX',
        dialCode: '+52',
        name: 'México',
        flag: '🇲🇽',
        minLength: 10,
        maxLength: 10,
    },
    {
        code: 'CO',
        dialCode: '+57',
        name: 'Colômbia',
        flag: '🇨🇴',
        minLength: 10,
        maxLength: 10,
    },
    {
        code: 'CL',
        dialCode: '+56',
        name: 'Chile',
        flag: '🇨🇱',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'PE',
        dialCode: '+51',
        name: 'Peru',
        flag: '🇵🇪',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'UY',
        dialCode: '+598',
        name: 'Uruguai',
        flag: '🇺🇾',
        minLength: 8,
        maxLength: 8,
    },
    {
        code: 'PY',
        dialCode: '+595',
        name: 'Paraguai',
        flag: '🇵🇾',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'ES',
        dialCode: '+34',
        name: 'Espanha',
        flag: '🇪🇸',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'GB',
        dialCode: '+44',
        name: 'Reino Unido',
        flag: '🇬🇧',
        minLength: 10,
        maxLength: 10,
    },
    {
        code: 'FR',
        dialCode: '+33',
        name: 'França',
        flag: '🇫🇷',
        minLength: 9,
        maxLength: 9,
    },
    {
        code: 'DE',
        dialCode: '+49',
        name: 'Alemanha',
        flag: '🇩🇪',
        minLength: 10,
        maxLength: 11,
    },
    {
        code: 'IT',
        dialCode: '+39',
        name: 'Itália',
        flag: '🇮🇹',
        minLength: 9,
        maxLength: 10,
    },
];

// Default country (Brazil)
export const DEFAULT_COUNTRY_CODE = 'BR';

/**
 * Get country by dial code
 */
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
    return COUNTRY_CODES.find(c => c.dialCode === dialCode);
}

/**
 * Get country by ISO code
 */
export function getCountryByCode(code: string): CountryCode | undefined {
    return COUNTRY_CODES.find(c => c.code === code);
}

/**
 * Get default country (Brazil)
 */
export function getDefaultCountry(): CountryCode {
    return COUNTRY_CODES.find(c => c.code === DEFAULT_COUNTRY_CODE)!;
}

/**
 * Extract country code from E.164 phone number
 * @param phone - Phone number in E.164 format (+5511999999999)
 * @returns Country code object or undefined
 */
export function extractCountryFromPhone(phone: string): CountryCode | undefined {
    if (!phone.startsWith('+')) return undefined;

    // Try to match dial codes from longest to shortest (to handle +1 vs +1xxx cases)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);

    for (const country of sorted) {
        if (phone.startsWith(country.dialCode)) {
            return country;
        }
    }

    return undefined;
}
