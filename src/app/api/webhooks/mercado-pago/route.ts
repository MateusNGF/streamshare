import { prisma } from "@/lib/db";
import { validateMPSignature, mpPayment } from "@/lib/mercado-pago";
import { billingService } from "@/services/billing-service";
import { StatusCobranca } from "@prisma/client";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    // MercadoPago envia o ID e o tipo via query params ou body
    const dataId = searchParams.get('data.id');
    const type = searchParams.get('type');

    if (!dataId || type !== 'payment') {
        return new Response(null, { status: 200 });
    }

    // Validação de segurança
    if (xSignature && xRequestId) {
        const isValid = validateMPSignature(xSignature, xRequestId, dataId);
        if (!isValid) {
            console.error('[MERCADOPAGO_WEBHOOK] Invalid Signature');
        }
    }

    try {
        // Busca o pagamento no MercadoPago para confirmar o status atual
        const payment = await mpPayment.get({ id: dataId });

        if (payment.status !== 'approved') {
            return new Response(`Payment status: ${payment.status}`, { status: 200 });
        }

        const cobranca = await prisma.cobranca.findFirst({
            where: { gatewayId: dataId }
        });

        if (!cobranca) {
            return new Response('Cobranca nao encontrada', { status: 200 });
        }

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

            // Reativar a assinatura se necessário
            if (assinatura) {
                await billingService.avaliarAtivacaoAposPagamento(tx, {
                    assinatura,
                    cobranca,
                    contaId: assinatura.streaming.contaId,
                    agora
                });
            }
        });

        return new Response(null, { status: 200 });
    } catch (error: any) {
        console.error('[MERCADOPAGO_WEBHOOK_ERROR]', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
