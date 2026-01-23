"use client";

import { PLANS_LIST, PlanDefinition } from "@/config/plans";
import { createCheckoutSession } from "@/actions/planos";
import { Check, Loader2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Toast, ToastVariant } from "@/components/ui/Toast";


import { ConfirmPlanChangeModal } from "@/components/modals/ConfirmPlanChangeModal";

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
    const [selectedPlanForConfirmation, setSelectedPlanForConfirmation] = useState<PlanDefinition | null>(null);

    useEffect(() => {
        if (searchParams.get("success")) {
            setToast({ message: "Plano atualizado com sucesso!", variant: "success" });
            router.refresh();
        }
        if (searchParams.get("canceled")) {
            setToast({ message: "Pagamento cancelado.", variant: "error" });
        }
    }, [searchParams, router]);

    const handleSelectPlan = (plan: PlanDefinition) => {
        if (!isLoggedIn) {
            router.push(`/login?plan=${plan.id}`);
            return;
        }

        if (plan.id === currentPlan) return;

        // Open modal for confirmation
        setSelectedPlanForConfirmation(plan);
    };

    const confirmChangePlan = async () => {
        const plan = selectedPlanForConfirmation;
        if (!plan) return;

        setLoading(plan.id);
        try {
            const result = await createCheckoutSession(plan.id);
            if (result && result.url) {
                window.location.href = result.url;
            } else if (result && result.success) {
                setToast({ message: "Plano alterado com sucesso!", variant: "success" });
                router.refresh();
                setLoading(null);
                setSelectedPlanForConfirmation(null);
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
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
                    <p className="text-xl text-gray-600 mb-4">Escolha o plano ideal para você</p>
                    <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full hover:bg-green-200 transition-colors">
                        <Star className="text-green-600" size={20} fill="currentColor" />
                        <span className="text-green-700 font-semibold">
                            Garantia de reembolso em 7 dias
                        </span>
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {PLANS_LIST.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const isHighlighted = plan.highlighted;

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative flex flex-col p-8 rounded-[32px] transition-all duration-300
                                ${isHighlighted
                                    ? "bg-gray-900 text-white shadow-xl scale-105 border-2 border-primary ring-4 ring-primary/10 z-10 hover:shadow-2xl hover:scale-[1.07]"
                                    : "bg-white text-gray-900 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-2"
                                }
                            `}
                        >
                            {/* Badge Popular (se houver) */}
                            {isHighlighted && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse">
                                    <Star size={14} fill="currentColor" />
                                    Mais Popular
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-8 text-center pt-2">
                                <h3 className={`text-xl font-bold mb-2 ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                    {plan.label}
                                </h3>
                                <p className={`text-sm ${isHighlighted ? "text-gray-300" : "text-gray-500"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            {/* Preço */}
                            <div className="text-center mb-8">
                                <div className="flex items-end justify-center gap-1">
                                    <span className="text-lg opacity-60">R$</span>
                                    <span className={`text-5xl font-extrabold tracking-tight ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                        {plan.price.toString().replace('.', ',')}
                                    </span>
                                    <span className="text-lg opacity-60">/mês</span>
                                </div>
                                <p className={`text-xs mt-2 font-medium ${isHighlighted ? "text-primary-300" : "text-primary"}`}>
                                    {plan.subDescription}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <div className={`
                                            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors
                                            ${feature.included
                                                ? (isHighlighted ? "bg-primary text-white group-hover:bg-primary-400" : "bg-primary/10 text-primary group-hover:bg-primary/20")
                                                : "bg-gray-100 text-gray-300"
                                            }
                                        `}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm ${isHighlighted ? "text-gray-300" : "text-gray-600"}`}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={loading !== null || isCurrent}
                                className={`
                                    w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                                    ${isCurrent
                                        ? "bg-gray-100 text-gray-400 cursor-default"
                                        : isHighlighted
                                            ? "bg-primary hover:bg-primary-600 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50"
                                            : "bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg"
                                    }
                                    ${loading !== null && !isCurrent ? "opacity-70 cursor-wait" : ""}
                                `}
                            >
                                {loading === plan.id ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : isCurrent ? (
                                    "Seu Plano Atual"
                                ) : (
                                    plan.price > 0 ? "Assinar Agora" : "Selecionar Grátis"
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer info */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                    Precisa de um plano personalizado? <a href="#" className="text-primary hover:underline">Entre em contato</a> com nossa equipe comercial.
                </p>
            </div>

            {/* Modal de Confirmação */}
            {selectedPlanForConfirmation && (
                <ConfirmPlanChangeModal
                    isOpen={!!selectedPlanForConfirmation}
                    onClose={() => setSelectedPlanForConfirmation(null)}
                    onConfirm={confirmChangePlan}
                    loading={loading === selectedPlanForConfirmation.id}
                    planName={selectedPlanForConfirmation.label}
                    price={selectedPlanForConfirmation.price}
                    currentPlanName={PLANS_LIST.find(p => p.id === currentPlan)?.label || "Atual"}
                />
            )}

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
