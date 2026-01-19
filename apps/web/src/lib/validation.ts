/**
 * Validation utilities with regex patterns and validation logic
 * for common Brazilian document formats and contact information
 */

/**
 * Remove all non-numeric characters from a string
 */
export function removeNonNumeric(value: string): string {
    return value.replace(/\D/g, "");
}

/**
 * Validate CPF format and check digits
 * @param cpf - CPF string with or without mask
 * @returns true if CPF is valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
    const cleaned = removeNonNumeric(cpf);

    // Check if has 11 digits
    if (cleaned.length !== 11) {
        return false;
    }

    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cleaned)) {
        return false;
    }

    // Validate check digits
    let sum = 0;
    let remainder;

    // Validate first check digit
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

    return true;
}

/**
 * Validate phone number in E.164 international format
 * @param phone - Phone string in E.164 format (+5511999999999)
 * @returns true if phone is valid E.164 format, false otherwise
 */
export function validateE164Phone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    // Must start with +
    if (!phone.startsWith('+')) {
        return false;
    }

    // Remove + and check if rest are digits
    const digits = phone.substring(1);
    if (!/^\d+$/.test(digits)) {
        return false;
    }

    // E.164 allows 1-15 digits total (including country code)
    // Minimum realistic is country code (1-3 digits) + phone (7+ digits) = 8 digits
    if (digits.length < 8 || digits.length > 15) {
        return false;
    }

    return true;
}

/**
 * Validate Brazilian phone number format
 * Accepts both landline (10 digits) and mobile (11 digits)
 * @param phone - Phone string with or without mask, can be in E.164 format
 * @returns true if phone is valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
    // If it's in E.164 format, validate as E.164
    if (phone.startsWith('+')) {
        return validateE164Phone(phone);
    }

    const cleaned = removeNonNumeric(phone);

    // Check if has 10 or 11 digits (Brazilian format)
    if (cleaned.length !== 10 && cleaned.length !== 11) {
        return false;
    }

    // Check if area code is valid (11-99)
    const areaCode = parseInt(cleaned.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) {
        return false;
    }

    // For mobile numbers (11 digits), check if starts with 9
    if (cleaned.length === 11) {
        const firstDigit = cleaned.charAt(2);
        if (firstDigit !== "9") {
            return false;
        }
    }

    return true;
}

/**
 * Enhanced email validation with common patterns
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
    if (!email || email.trim() === "") {
        return true; // Empty email is valid (optional field)
    }

    // RFC 5322 compliant email regex (simplified version)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email.trim());
}

/**
 * Get user-friendly error messages for validation failures
 */
export const ValidationMessages = {
    cpf: {
        required: "CPF é obrigatório",
        invalid: "CPF inválido",
        format: "CPF deve ter 11 dígitos",
    },
    phone: {
        required: "Telefone é obrigatório",
        invalid: "Telefone inválido",
        format: "Telefone deve ter 10 ou 11 dígitos",
    },
    email: {
        invalid: "Email inválido",
    },
    name: {
        required: "Nome é obrigatório",
    },
} as const;
