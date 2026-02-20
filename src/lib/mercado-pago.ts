import { MercadoPagoConfig, Preference, Payment, PreApproval } from 'mercadopago';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Lista de IPs conhecidos do Mercado Pago para validação (opcional mas recomendado)
export const MERCADOPAGO_IPS = [
    '209.225.48.0/20',
    '34.192.0.0/12',
    '54.80.0.0/12',
    '52.192.0.0/11'
];

export const mpPreference = new Preference(client);
export const mpPayment = new Payment(client);
export const mpPreApproval = new PreApproval(client);

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
                    success: `${process.env.NEXT_PUBLIC_URL}/faturamento?success=true`,
                    failure: `${process.env.NEXT_PUBLIC_URL}/faturamento?error=true`,
                    pending: `${process.env.NEXT_PUBLIC_URL}/faturamento?pending=true`,
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

interface CreatePixData extends CreatePreferenceData {
    first_name?: string;
    cpf?: string;
}

/**
 * Gera um pagamento via PIX no MercadoPago
 */
export async function createPixPayment(data: CreatePixData) {
    try {
        const payerEmail = data.email && data.email.includes('@') ? data.email : `cliente_${data.id}@streamshare.com.br`;

        const body: any = {
            transaction_amount: data.unit_price,
            description: data.description,
            payment_method_id: 'pix',
            payer: {
                email: payerEmail,
                first_name: data.first_name || 'Participante',
            },
            external_reference: data.external_reference,
            ...(process.env.MERCADOPAGO_WEBHOOK_URL && process.env.MERCADOPAGO_WEBHOOK_URL.startsWith('http') ? { notification_url: process.env.MERCADOPAGO_WEBHOOK_URL } : {}),
        };

        // Adicionar CPF se disponível
        if (data.cpf) {
            body.payer.identification = {
                type: 'CPF',
                number: data.cpf.replace(/\D/g, '')
            };
        }

        const response = await mpPayment.create({ body });

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
    } catch (error: any) {
        console.error('[MERCADOPAGO_CREATE_PIX]', {
            error: error.message,
            status: error.status,
            details: error.response?.data || error.response || 'No extra details'
        });
        return { success: false, error: 'Erro ao gerar pagamento PIX no gateway' };
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

/**
 * Realiza o estorno de um pagamento (Direct-to-Origin)
 */
export async function refundPayment(paymentId: string) {
    try {
        // O MercadoPago permite estornos totais enviando apenas o ID do pagamento
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID(),
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao processar estorno');
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('[MERCADOPAGO_REFUND]', error);
        return { success: false, error: error.message || 'Erro interno ao estornar' };
    }
}

/**
 * Cria uma assinatura recorrente para o SaaS (Plano Pro/Business)
 */
export async function createSaaSSubscription(planId: string, email: string, externalReference: string) {
    try {
        // Fluxo de Redirecionamento Estático (Checkout Pro para Assinaturas)
        // Isso evita o erro 'card_token_id is required' pois o MP gerencia o pagamento na página deles.
        const baseUrl = "https://www.mercadopago.com.br/subscriptions/checkout";
        const init_point = `${baseUrl}?preapproval_plan_id=${planId}&external_reference=${externalReference}&payer_email=${email}`;

        return {
            success: true,
            init_point: init_point,
            id: undefined // ID será gerado pelo MP após o pagamento e enviado via Webhook
        };
    } catch (error: any) {
        console.error('[MERCADOPAGO_CREATE_SUBSCRIPTION_ERROR]', {
            message: error.message,
            status: error.status,
            cause: error.cause,
            details: error.response?.data || error.response || 'No extra details'
        });
        return { success: false, error: 'Erro ao criar assinatura no MercadoPago: ' + (error.message || 'Erro desconhecido') };
    }
}

/**
 * Cancela uma assinatura recorrente do SaaS (Pre-Approval)
 */
export async function cancelSaaSSubscription(subscriptionId: string) {
    try {
        const response = await mpPreApproval.update({
            id: subscriptionId,
            body: {
                status: 'cancelled'
            }
        });

        return { success: true, data: response };
    } catch (error: any) {
        console.error('[MERCADOPAGO_CANCEL_SUBSCRIPTION]', error);
        return { success: false, error: 'Erro ao cancelar assinatura no MercadoPago' };
    }
}

/**
 * Reativa uma assinatura recorrente do SaaS (Pre-Approval)
 */
export async function reactivateSaaSSubscription(subscriptionId: string) {
    try {
        const response = await mpPreApproval.update({
            id: subscriptionId,
            body: {
                status: 'authorized'
            }
        });

        return { success: true, data: response };
    } catch (error: any) {
        console.error('[MERCADOPAGO_REACTIVATE_SUBSCRIPTION]', error);
        return { success: false, error: 'Erro ao reativar assinatura no MercadoPago' };
    }
}

/**
 * Busca detalhes de uma assinatura recorrente do SaaS (Pre-Approval)
 */
export async function getSaaSSubscription(subscriptionId: string) {
    try {
        const response = await mpPreApproval.get({ id: subscriptionId });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('[MERCADOPAGO_GET_SUBSCRIPTION]', error);
        return { success: false, error: 'Erro ao buscar assinatura no MercadoPago' };
    }
}

/**
 * Adaptador Unificado para MercadoPago
 */
export const mercadoPagoAdapter = {
    /**
     * Fluxo de Planos (SaaS)
     */
    plans: {
        create: createSaaSSubscription,
        cancel: cancelSaaSSubscription,
        reactivate: reactivateSaaSSubscription,
        get: getSaaSSubscription,
    },
    /**
     * Fluxo de Streamings (Participantes)
     */
    payments: {
        createPix: createPixPayment,
        createPreference: createCheckoutPreference,
        refund: refundPayment,
    },
    /**
     * Segurança e Webhooks
     */
    security: {
        validateSignature: validateMPSignature,
        isMercadoPagoIP: (ip: string) => {
            // Simplificação: Em produção, usar uma lib de CIDR para checar os ranges
            // Para este desafio, manteremos a estrutura para expansão futura
            return true;
        }
    }
};
