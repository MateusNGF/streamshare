/**
 * Password Validation Utility
 * 
 * Centralized password validation logic to ensure consistency
 * across all password-related forms in the application.
 */

export interface PasswordValidationResult {
    isValid: boolean;
    error: string | null;
}

export interface PasswordRequirement {
    id: string;
    label: string;
    test: (password: string) => boolean;
}

/**
 * Password requirements configuration
 */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    {
        id: 'minLength',
        label: 'Mínimo de 8 caracteres',
        test: (pwd) => pwd.length >= 8,
    },
    {
        id: 'uppercase',
        label: 'Pelo menos uma letra maiúscula',
        test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
        id: 'lowercase',
        label: 'Pelo menos uma letra minúscula',
        test: (pwd) => /[a-z]/.test(pwd),
    },
    {
        id: 'number',
        label: 'Pelo menos um número',
        test: (pwd) => /[0-9]/.test(pwd),
    },
];

/**
 * Validates a password against all requirements
 * @param password - The password to validate
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string): PasswordValidationResult {
    if (!password) {
        return {
            isValid: false,
            error: 'Senha é obrigatória',
        };
    }

    for (const requirement of PASSWORD_REQUIREMENTS) {
        if (!requirement.test(password)) {
            return {
                isValid: false,
                error: requirement.label,
            };
        }
    }

    return {
        isValid: true,
        error: null,
    };
}

/**
 * Checks which requirements are met by the password
 * @param password - The password to check
 * @returns Array of requirement IDs that are met
 */
export function getMetRequirements(password: string): string[] {
    return PASSWORD_REQUIREMENTS
        .filter(req => req.test(password))
        .map(req => req.id);
}

/**
 * Calculates password strength (0-100)
 * @param password - The password to evaluate
 * @returns Strength score from 0 to 100
 */
export function getPasswordStrength(password: string): number {
    if (!password) return 0;

    const metRequirements = getMetRequirements(password);
    const baseScore = (metRequirements.length / PASSWORD_REQUIREMENTS.length) * 60;

    // Bonus points for length
    const lengthBonus = Math.min((password.length - 8) * 2, 20);

    // Bonus for special characters
    const specialCharBonus = /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 10 : 0;

    // Bonus for variety
    const varietyBonus = new Set(password).size >= 8 ? 10 : 0;

    return Math.min(baseScore + lengthBonus + specialCharBonus + varietyBonus, 100);
}

/**
 * Gets password strength label
 * @param strength - Strength score (0-100)
 * @returns Strength label and color
 */
export function getPasswordStrengthLabel(strength: number): {
    label: string;
    color: string;
} {
    if (strength === 0) return { label: '', color: '' };
    if (strength < 40) return { label: 'Fraca', color: 'text-red-600' };
    if (strength < 70) return { label: 'Média', color: 'text-yellow-600' };
    if (strength < 90) return { label: 'Forte', color: 'text-green-600' };
    return { label: 'Muito Forte', color: 'text-green-700' };
}
