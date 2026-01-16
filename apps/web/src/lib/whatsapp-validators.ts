/**
 * WhatsApp Validation Functions
 */

import { WhatsAppValidationError } from '@/types/whatsapp';

/**
 * Valida número de telefone
 * @param phone - Número de telefone a validar
 * @throws {WhatsAppValidationError} Se o número for inválido
 */
export function validatePhoneNumber(phone: string): void {
    if (!phone || typeof phone !== 'string') {
        throw new WhatsAppValidationError('Número de telefone não fornecido');
    }

    // Remove caracteres não numéricos exceto +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Deve ter entre 10 e 15 dígitos (padrão E.164)
    if (cleaned.length < 10 || cleaned.length > 15) {
        throw new WhatsAppValidationError(
            'Número de telefone inválido. Deve ter entre 10 e 15 dígitos.'
        );
    }
}

/**
 * Valida mensagem do WhatsApp
 * @param message - Mensagem a validar
 * @param maxLength - Tamanho máximo permitido (padrão: 4096 chars)
 * @throws {WhatsAppValidationError} Se a mensagem for inválida
 */
export function validateMessage(message: string, maxLength = 4096): void {
    if (!message || typeof message !== 'string') {
        throw new WhatsAppValidationError('Mensagem não pode estar vazia');
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
        throw new WhatsAppValidationError('Mensagem não pode conter apenas espaços');
    }

    if (message.length > maxLength) {
        throw new WhatsAppValidationError(
            `Mensagem muito longa. Máximo de ${maxLength} caracteres (atual: ${message.length}).`
        );
    }
}
