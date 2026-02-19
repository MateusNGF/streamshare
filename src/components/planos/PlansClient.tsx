"use client";

import { PLANS_LIST, PlanDefinition } from "@/config/plans";
import { createCheckoutSession, verifySaaSSubscriptionAction } from "@/actions/planos";
import { Check, Loader2, Star } from "lucide-react";
import { useState, useEffect } from "react";
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
        const handleRedirectParams = async () => {
            const url = window.location.href;

            // 1. Detect Cancellation
            if (searchParams.get("canceled") || url.includes("canceled")) {
                return setToast({ message: "Pagamento cancelado.", variant: "error" });
            }

            // 2. Extract Preapproval ID (Handles MP double-question-mark bug)
            const preapprovalId = searchParams.get("preapproval_id") ||
                url.match(/[?&]preapproval_id=([^&#]*)/)?.[1];

            if (!preapprovalId) return;

            // 3. Process Plan Verification
            setToast({ message: "Processando pagamento...", variant: "info" });

            try {
                const res = await verifySaaSSubscriptionAction(preapprovalId);

                if (res.success) {
                    setToast({ message: "Plano atualizado com sucesso!", variant: "success" });
                    setTimeout(() => {
                        router.refresh();
                        router.replace("/planos");
                    }, 2000);
                } else {
                    setToast({ message: res.error || "Erro ao verificar plano.", variant: "error" });
                }
            } catch (error) {
                setToast({ message: "Falha na comunicação com o gateway.", variant: "error" });
            }
        };

        handleRedirectParams();
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

            <div className="py-20 -my-20 flex flex-row items-stretch gap-6 lg:gap-8 overflow-x-auto px-8 -mx-8 scrollbar-hide snap-x snap-mandatory">
                {PLANS_LIST.map((plan, index) => {
                    const isCurrent = currentPlan === plan.id;
                    const isHighlighted = plan.highlighted;

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative flex flex-col px-7 py-8 rounded-[40px] transition-all duration-500 
                                w-[82vw] sm:w-[340px] flex-shrink-0 snap-center animate-scale-in
                                ${isHighlighted
                                    ? "bg-gray-900 text-white shadow-[0_20px_50px_rgba(109,40,217,0.3)] scale-105 border-2 border-primary/50 ring-8 ring-primary/5 z-10 hover:shadow-[0_30px_60px_rgba(109,40,217,0.4)] hover:scale-[1.07] mx-2"
                                    : "bg-white text-gray-900 border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30"
                                }
                            `}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Badge Popular (se houver) */}
                            {isHighlighted && !plan.comingSoon && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient-x text-white px-6 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 whitespace-nowrap tracking-wider uppercase">
                                    <Star size={14} fill="currentColor" className="animate-pulse" />
                                    Escolha Premium
                                </div>
                            )}

                            {plan.comingSoon && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 whitespace-nowrap tracking-wider uppercase">
                                    <Loader2 size={14} className="animate-spin" />
                                    Em Breve
                                </div>
                            )}

                            {/* Header & Price Grouped for space optimization */}
                            <div className="flex flex-col gap-6 mb-8">
                                <div className="text-center pt-2">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${isHighlighted ? "text-primary-400" : "text-primary"}`}>
                                        {plan.price === 0 ? "Começo Rápido" : "Acesso Total"}
                                    </span>
                                    <h3 className={`text-2xl font-black mb-1 tracking-tight ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                        {plan.label}
                                    </h3>
                                    <p className={`text-xs font-medium leading-relaxed opacity-60 ${isHighlighted ? "text-gray-400" : "text-gray-500"}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className={`flex flex-col items-center p-6 rounded-3xl ${isHighlighted ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}>
                                    <div className="flex items-start gap-1">
                                        <span className="text-xs font-bold mt-1.5 opacity-40 uppercase">R$</span>
                                        <div className="flex items-baseline">
                                            <span className={`text-5xl font-black tracking-tighter ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                                {plan.price.toString().split('.')[0]}
                                            </span>
                                            <span className={`text-xl font-bold opacity-40 ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                                ,{plan.price.toString().split('.')[1] || '00'}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-bold mt-auto mb-1.5 opacity-40 uppercase ml-1`}>/mês</span>
                                    </div>
                                    <div className={`mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isHighlighted ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                        {plan.subDescription}
                                    </div>
                                </div>
                            </div>

                            {/* Features Container */}
                            <div className="flex-1 overflow-hidden">
                                <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 mb-4 block text-center ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                                    O que está incluído
                                </span>
                                <div className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className={`
                                                flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all duration-300
                                                ${feature.included
                                                    ? (isHighlighted ? "bg-primary text-white shadow-[0_0_10px_rgba(109,40,217,0.4)]" : "bg-primary/20 text-primary")
                                                    : "bg-gray-100 text-gray-300"
                                                }
                                            `}>
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                            <span className={`text-[13px] font-semibold tracking-tight ${isHighlighted ? "text-gray-300" : "text-gray-600"} ${!feature.included && "opacity-40 line-through decoration-gray-400"}`}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => !plan.comingSoon && handleSelectPlan(plan)}
                                disabled={loading !== null || isCurrent || plan.comingSoon}
                                className={`
                                    w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.97]
                                    ${isCurrent
                                        ? "bg-gray-100/50 text-gray-400 cursor-default border border-gray-100"
                                        : isHighlighted
                                            ? "bg-primary hover:bg-white hover:text-gray-900 text-white shadow-lg"
                                            : "bg-gray-900 border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 text-white"
                                    }
                                    ${loading !== null && !isCurrent ? "opacity-70 cursor-wait" : ""}
                                `}
                            >
                                {loading === plan.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isCurrent ? (
                                    "Plano Ativo"
                                ) : (
                                    plan.price > 0 ? "Garantir Vaga" : "Começar Agora"
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
