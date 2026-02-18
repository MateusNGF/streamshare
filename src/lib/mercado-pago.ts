import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export const mpPreference = new Preference(client);
export const mpPayment = new Payment(client);

interface CreatePreferenceData {
    id: string;
    title: string;
    description: string;
    unit_price: number;
    email: string;
    external_reference: string;
}

/**
 * Cria uma preferência de checkout no MercadoPago (Cartão)
 */
export async function createCheckoutPreference(data: CreatePreferenceData) {
    try {
        const response = await mpPreference.create({
            body: {
                items: [
                    {
                        id: data.id,
                        title: data.title,
                        description: data.description,
                        unit_price: data.unit_price,
                        quantity: 1,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    email: data.email,
                },
                external_reference: data.external_reference,
                notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/financas?success=true`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/financas?error=true`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/financas?pending=true`,
                },
                auto_return: 'approved',
                payment_methods: {
                    excluded_payment_types: [
                        { id: 'ticket' },
                        { id: 'bank_transfer' }
                    ],
                    installments: 12,
                }
            }
        });

        return { success: true, init_point: response.init_point, id: response.id };
    } catch (error) {
        console.error('[MERCADOPAGO_CREATE_PREFERENCE]', error);
        return { success: false, error: 'Erro ao criar preferência de pagamento' };
    }
}

/**
 * Gera um pagamento via PIX no MercadoPago
 */
export async function createPixPayment(data: CreatePreferenceData) {
    try {
        const response = await mpPayment.create({
            body: {
                transaction_amount: data.unit_price,
                description: data.description,
                payment_method_id: 'pix',
                payer: {
                    email: data.email,
                },
                external_reference: data.external_reference,
                notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
            }
        });

        // Extrai dados do PIX
        const pixData = response.point_of_interaction?.transaction_data;

        return {
            success: true,
            id: response.id?.toString(),
            qr_code_base64: pixData?.qr_code_base64,
            qr_code: pixData?.qr_code,
            ticket_url: pixData?.ticket_url,
            status: response.status
        };
    } catch (error) {
        console.error('[MERCADOPAGO_CREATE_PIX]', error);
        return { success: false, error: 'Erro ao gerar pagamento PIX' };
    }
}

/**
 * Valida a assinatura do Webhook do MercadoPago
 */
export function validateMPSignature(xSignature: string, xRequestId: string, dataId: string) {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) return false;

    // A validação do MP mudou recentemente para usar o x-signature com HMAC-SHA256
    // mas depende do formato enviado. Se for o novo:
    try {
        const parts = xSignature.split(',');
        let ts = '';
        let hash = '';

        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key.trim() === 'ts') ts = value;
            if (key.trim() === 'v1') hash = value;
        });

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const digest = hmac.digest('hex');

        return digest === hash;
    } catch (e) {
        return false;
    }
}
