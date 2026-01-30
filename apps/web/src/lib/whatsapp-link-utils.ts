/**
 * Utilities for generating WhatsApp web links
 */

import { validatePhoneNumber, validateMessage } from './whatsapp-validators';

/**
 * Gera link wa.me para envio manual de mensagem WhatsApp
 * @param phoneNumber - Número no formato E.164 (+5511999999999) ou com whatsapp: prefix
 * @param message - Mensagem a enviar
 * @returns URL wa.me formatada
 * @throws {WhatsAppValidationError} Se número ou mensagem forem inválidos
 * 
 * @example
 * generateWhatsAppLink('whatsapp:+5511999999999', 'Olá!')
 * // Returns: 'https://wa.me/5511999999999?text=Ol%C3%A1!'
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
    // Validar inputs
    validatePhoneNumber(phoneNumber);
    validateMessage(message);

    // Remover prefixo 'whatsapp:' se existir
    let cleanNumber = phoneNumber.replace('whatsapp:', '').trim();

    // Remover todos os caracteres não numéricos exceto o +
    cleanNumber = cleanNumber.replace(/[^\d+]/g, '');

    // Garantir que está no formato E.164 (começa com +)
    if (!cleanNumber.startsWith('+')) {
        throw new Error('Número de telefone deve estar no formato E.164 (+código_país + número)');
    }

    // Encode mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // Formato: https://wa.me/5511999999999?text=mensagem
    // Remove o + para wa.me (wa.me não aceita + no número)
    const numberForLink = cleanNumber.replace('+', '');

    return `https://wa.me/${numberForLink}?text=${encodedMessage}`;
}

/**
 * Gera link wa.me apenas com texto (sem número de destino)
 * Útil para copiar mensagem e enviar manualmente
 * @param message - Mensagem a incluir no link
 * @returns URL wa.me formatada sem número de destino
 * 
 * @example
 * generateWhatsAppLinkTextOnly('Olá!')
 * // Returns: 'https://wa.me/?text=Ol%C3%A1!'
 */
export function generateWhatsAppLinkTextOnly(message: string): string {
    validateMessage(message);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
}

