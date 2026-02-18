import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { PlanoConta } from "@prisma/client";
import { PLANS_LIST } from "@/config/plans";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("Stripe Webhook Error:", error.message);
        return new Response(`Webhook Error`, { status: 400 });
    }


    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.metadata?.contaId) {
            return new Response(null, { status: 200 });
        }

        const contaId = parseInt(session.metadata.contaId);
        const plano = session.metadata.plano as PlanoConta;
        const planConfig = PLANS_LIST.find(p => p.id === plano);

        await prisma.$transaction(async (tx) => {
            await tx.conta.update({
                where: { id: contaId },
                data: {
                    gatewayCustomerId: session.customer as string,
                    gatewaySubscriptionId: session.subscription as string,
                    gatewaySubscriptionStatus: "active",
                    gatewayCancelAtPeriodEnd: false,
                    plano: plano,
                },
            });

            await tx.notificacao.create({
                data: {
                    contaId: contaId,
                    tipo: "plano_alterado",
                    titulo: "Assinatura Confirmada",
                    descricao: `Parabéns! Sua assinatura do plano ${planConfig?.label || plano} foi confirmada.`,
                    metadata: { plano, session: session.id }
                }
            });
        });
    }

    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;
        const account = await prisma.conta.findFirst({
            where: { gatewaySubscriptionId: subscription.id },
        });

        if (account) {
            const priceId = subscription.items.data[0]?.price.id;
            const planConfig = PLANS_LIST.find(p => p.stripePriceId === priceId);

            await prisma.$transaction(async (tx) => {
                await tx.conta.update({
                    where: { id: account.id },
                    data: {
                        gatewaySubscriptionStatus: subscription.status,
                        gatewayCancelAtPeriodEnd: subscription.cancel_at_period_end,
                        ...(planConfig && {
                            plano: planConfig.id
                        })
                    },
                });

                if (planConfig) {
                    await tx.notificacao.create({
                        data: {
                            contaId: account.id,
                            tipo: "plano_alterado",
                            titulo: "Plano Atualizado",
                            descricao: `Seu plano foi atualizado para ${planConfig.label}.`,
                            metadata: { plano: planConfig.id, subscriptionId: subscription.id }
                        }
                    });
                }
            });
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const account = await prisma.conta.findFirst({
            where: { gatewaySubscriptionId: subscription.id },
        });

        if (account) {
            await prisma.$transaction(async (tx) => {
                await tx.conta.update({
                    where: { id: account.id },
                    data: {
                        gatewaySubscriptionStatus: subscription.status,
                        gatewayCancelAtPeriodEnd: false,
                        plano: "free",
                    },
                });

                await tx.notificacao.create({
                    data: {
                        contaId: account.id,
                        tipo: "plano_alterado",
                        titulo: "Assinatura Cancelada",
                        descricao: "Sua assinatura foi cancelada e sua conta retornou ao plano Gratuito.",
                        metadata: { transition: "pro_to_free", reason: "subscription_deleted" }
                    }
                });
            });
        }
    }

    return new Response(null, { status: 200 });
}
