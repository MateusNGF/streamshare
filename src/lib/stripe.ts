import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    appInfo: {
        name: "StreamShare",
        version: "1.0.0",
    },
    typescript: true,
});

export function getStripeUrl(path: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${path}`;
}
