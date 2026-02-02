/**
 * WhatsApp Integration Type Definitions
 */

export interface EnviarNotificacaoResult {
    success: boolean;
    manualLink?: string;
    message?: string;
}

export interface WhatsAppLinkOptions {
    phoneNumber: string;
    message: string;
    maxMessageLength?: number;
}

export class WhatsAppValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WhatsAppValidationError';
    }
}
