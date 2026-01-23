"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createCheckoutSession } from "@/actions/planos"; // Adjust import path if needed
import { Loader2 } from "lucide-react";

export default function CheckoutStartPage() {
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan");

    useEffect(() => {
        if (planId) {
            createCheckoutSession(planId as any)
                .then((res) => {
                    if (res?.url) window.location.href = res.url;
                })
                .catch((err) => {
                    console.error(err);
                    alert("Erro ao iniciar checkout.");
                });
        }
    }, [planId]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">Iniciando pagamento...</h2>
                <p className="text-gray-500">Você será redirecionado para o Stripe em instantes.</p>
            </div>
        </div>
    );
}
