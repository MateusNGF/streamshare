import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma, PlanoConta } from "@streamshare/database";
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
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const subscription = event.data.object as Stripe.Subscription;

    if (event.type === "checkout.session.completed") {
        if (!session.metadata?.contaId) {
            return new Response(null, { status: 200 });
        }

        const contaId = parseInt(session.metadata.contaId);
        const plano = session.metadata.plano as PlanoConta;

        // Find plan details to set limits
        const planConfig = PLANS_LIST.find(p => p.id === plano);

        await prisma.conta.update({
            where: { id: contaId },
            data: {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                stripeSubscriptionStatus: "active",
                plano: plano,
                limiteGrupos: planConfig?.limiteGrupos || 5
            },
        });
    }

    if (event.type === "customer.subscription.updated") {
        // Find account by stripeSubscriptionId
        const account = await prisma.conta.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (account) {
            await prisma.conta.update({
                where: { id: account.id },
                data: {
                    stripeSubscriptionStatus: subscription.status,
                },
            });
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const account = await prisma.conta.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (account) {
            // Downgrade to Basic
            await prisma.conta.update({
                where: { id: account.id },
                data: {
                    stripeSubscriptionStatus: subscription.status,
                    plano: "basico",
                    limiteGrupos: 5
                },
            });
        }
    }

    return new Response(null, { status: 200 });
}
