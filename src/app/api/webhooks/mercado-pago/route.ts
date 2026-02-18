import { prisma } from "@/lib/db";
import { validateMPSignature, mpPayment, mpPreApproval } from "@/lib/mercado-pago";
import { billingService } from "@/services/billing-service";
import { StatusCobranca, PlanoConta } from "@prisma/client";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    // MercadoPago envia o ID e o tipo via query params ou body
    const dataId = searchParams.get('data.id');
    const type = searchParams.get('type');

    if (!dataId) {
        return new Response(null, { status: 200 });
    }

    // Validação de segurança (Obrigatória em Produção)
    if (xSignature && xRequestId) {
        const isValid = validateMPSignature(xSignature, xRequestId, dataId);
        if (!isValid) {
            console.error('[MERCADOPAGO_WEBHOOK] Falha na validação de assinatura (HMAC)');
            return new Response('Invalid Signature', { status: 401 });
        }
    } else if (process.env.NODE_ENV === 'production') {
        // Bloqueia requests sem assinatura em produção
        return new Response('Signature Required', { status: 401 });
    }

    try {
        const agora = new Date();

        // ROTEAMENTO DE EVENTOS

        // CASO 1: PAGAMENTO DE ASSINATURA DE PARTICIPANTE (STREAMING)
        // O MercadoPago envia type='payment' para notificações de API de Payments
        if (type === 'payment' || type === 'payment.updated' || type === 'payment.created') {
            const payment = await mpPayment.get({ id: dataId });

            if (payment.status !== 'approved') {
                return new Response(`Payment status: ${payment.status}`, { status: 200 });
            }

            const cobranca = await prisma.cobranca.findFirst({
                where: { gatewayId: dataId }
            });

            if (cobranca) {
                const agora = new Date();
                await prisma.$transaction(async (tx) => {
                    await tx.cobranca.update({
                        where: { id: cobranca.id },
                        data: {
                            status: StatusCobranca.pago,
                            dataPagamento: agora,
                        }
                    });

                    const assinatura = await tx.assinatura.findUnique({
                        where: { id: cobranca.assinaturaId },
                        include: {
                            participante: true,
                            streaming: { select: { contaId: true } }
                        }
                    });

                    await tx.notificacao.create({
                        data: {
                            contaId: assinatura?.streaming.contaId || 0,
                            tipo: 'cobranca_confirmada',
                            titulo: 'Pagamento Confirmado',
                            descricao: `O pagamento da cobrança #${cobranca.id} foi confirmado via MercadoPago.`,
                            metadata: { cobrancaId: cobranca.id, gatewayId: dataId, externalReference: payment.external_reference }
                        }
                    });

                    if (assinatura) {
                        await billingService.avaliarAtivacaoAposPagamento(tx, {
                            assinatura,
                            cobranca,
                            contaId: assinatura.streaming.contaId,
                            agora
                        });
                    }
                });
            }
        }

        // CASO 2: ASSINATURA DE CONTA SaaS (PRE-APPROVAL)
        if (type === 'subscription_preapproval') {
            const preApproval = await mpPreApproval.get({ id: dataId });
            const externalRef = preApproval.external_reference; // format: saas_{contaId}_{plano}

            if (externalRef?.startsWith('saas_')) {
                const [, contaIdStr, plano] = externalRef.split('_');
                const contaId = parseInt(contaIdStr);

                await prisma.conta.update({
                    where: { id: contaId },
                    data: {
                        gatewaySubscriptionId: dataId,
                        gatewaySubscriptionStatus: preApproval.status as string,
                        plano: plano as PlanoConta
                    }
                });

                await prisma.notificacao.create({
                    data: {
                        contaId,
                        tipo: "plano_alterado",
                        titulo: "Sua assinatura Pro foi ativada!",
                        descricao: `A assinatura do plano ${plano} foi processada com sucesso no MercadoPago.`,
                        metadata: { preApprovalId: dataId, status: preApproval.status }
                    }
                });
            }
        }

        return new Response(null, { status: 200 });
    } catch (error: any) {
        console.error('[MERCADOPAGO_WEBHOOK_ERROR]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
