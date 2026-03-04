"use client";

import { PLANS_LIST, PlanDefinition } from "@/config/plans";
import { createCheckoutSession } from "@/actions/planos";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { PlanCard } from "./PlanCard";
import { useRouter, useSearchParams } from "next/navigation";

import { Toast, ToastVariant } from "@/components/ui/Toast";

interface PlansClientProps {
    currentPlan: string;
    isLoggedIn?: boolean;
    showHeader?: boolean;
}

export function PlansClient({ currentPlan, isLoggedIn = false, showHeader = true }: PlansClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

    useEffect(() => {
        if (searchParams.get("success")) {
            setToast({ message: "Plano atualizado com sucesso!", variant: "success" });
            router.refresh();
        }
        if (searchParams.get("canceled")) {
            setToast({ message: "Pagamento cancelado.", variant: "error" });
        }
    }, [searchParams, router]);

    const handleSelectPlan = async (plan: PlanDefinition) => {
        if (!isLoggedIn) {
            router.push(`/login?plan=${plan.id}`);
            return;
        }

        if (plan.id === currentPlan) return;

        setLoading(plan.id);
        try {
            const result = await createCheckoutSession(plan.id);
            if (result.success) {
                if ('data' in result && result.data && 'url' in result.data) {
                    window.location.href = result.data.url;
                } else {
                    setToast({ message: "Plano alterado com sucesso!", variant: "success" });
                    router.refresh();
                    setLoading(null);
                }
            } else if ('error' in result) {
                setToast({ message: result.error, variant: "error" });
                setLoading(null);
            }
        } catch (error) {
            console.error("Failed to update plan", error);
            setToast({ message: "Erro ao iniciar pagamento. Tente novamente.", variant: "error" });
            setLoading(null);
        }
    };

    return (
        <div className="w-full">
            {showHeader && (
                <div className="text-center mb-16 animate-fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
                    <p className="text-xl text-gray-600 mb-4">Escolha o plano ideal para você</p>
                    <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full hover:bg-green-200 transition-colors animate-bounce-subtle">
                        <Star className="text-green-600" size={20} fill="currentColor" />
                        <span className="text-green-700 font-semibold">
                            Garantia de reembolso em 7 dias
                        </span>
                    </div>
                </div>
            )}

            <div className="   flex justify-start md:justify-center flex-row items-stretch gap-4 md:gap-8 overflow-x-auto  scrollbar-hide snap-x snap-mandatory py-12 md:py-20">
                {PLANS_LIST.map((plan, index) => (
                    <div
                        key={plan.id}
                        className={`flex-shrink-0 snap-center flex w-[85vw] sm:w-auto ${index === 0 ? 'ml-2 md:ml-0' : ''} ${index === PLANS_LIST.length - 1 ? 'mr-2 md:mr-0' : ''}`}
                    >
                        <PlanCard
                            plan={plan}
                            isCurrent={currentPlan === plan.id}
                            loading={loading === plan.id}
                            disabled={loading !== null}
                            onSelect={handleSelectPlan}
                        />
                    </div>
                ))}
            </div>

            {/* Footer info */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                    Precisa de um plano personalizado? <a href="#" className="text-primary hover:underline">Entre em contato</a> com nossa equipe comercial.
                </p>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
