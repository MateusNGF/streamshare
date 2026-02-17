"use client";

import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { createCustomerPortalSession } from "@/actions/planos";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Toast";

interface SubscriptionAlertProps {
    status: string | null;
}

export function SubscriptionAlert({ status }: SubscriptionAlertProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (status !== "past_due" && status !== "unpaid") {
        return null;
    }

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const result = await createCustomerPortalSession();
            if (result.success && result.data?.url) {
                window.location.href = result.data.url;
            } else if (!result.success && result.error) {
                alert(result.error);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao abrir portal de cobrança.");
            setLoading(false);
        }
    };

    const isUnpaid = status === "unpaid";

    return (
        <div className={`
            w-full px-6 py-4 mb-6 rounded-2xl flex items-center justify-between shadow-sm
            ${isUnpaid ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}
        `}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isUnpaid ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className={`font-bold ${isUnpaid ? "text-red-900" : "text-amber-900"}`}>
                        {isUnpaid ? "Assinatura Suspensa" : "Problema no Pagamento"}
                    </h3>
                    <p className={`text-sm ${isUnpaid ? "text-red-700" : "text-amber-700"}`}>
                        {isUnpaid
                            ? "Sua assinatura foi suspensa devido à falta de pagamento. Regularize agora para recuperar o acesso."
                            : "Não conseguimos renovar sua assinatura. Atualize seu cartão para evitar a suspensão."}
                    </p>
                </div>
            </div>

            <button
                onClick={handleManageSubscription}
                disabled={loading}
                className={`
                    px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                    ${isUnpaid
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                        : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200"}
                `}
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                {isUnpaid ? "Regularizar Agora" : "Atualizar Cartão"}
            </button>
        </div>
    );
}
