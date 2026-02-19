"use client";

import { useState } from "react";
import { Building2, User, Crown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PLANS } from "@/config/plans";
import { cancelSubscriptionAction, reactivateSubscriptionAction } from "@/actions/planos";
import { CancelSubscriptionModal } from "../modals/CancelSubscriptionModal";
import { ToastVariant } from "@/components/ui/Toast";

interface PlanCardSettingsProps {
    conta: any;
    showToast: (message: string, variant?: ToastVariant) => void;
}

export function PlanCardSettings({ conta, showToast }: PlanCardSettingsProps) {
    const router = useRouter();
    const currentPlanKey = (conta?.plano || "free") as keyof typeof PLANS;
    const planDetails = PLANS[currentPlanKey];
    const isPro = currentPlanKey === "pro";
    const usage = conta?._count || { grupos: 0, streamings: 0, participantes: 0 };
    const isActive = conta?.isAtivo;
    const isCanceled = conta?.gatewayCancelAtPeriodEnd;

    const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const handleCancelSubscription = async () => {
        setIsLoadingSubscription(true);
        try {
            const result = await cancelSubscriptionAction();
            if (result.success) {
                showToast("Assinatura cancelada com sucesso. O acesso continua até o fim do período.", "success");
                setIsCancelModalOpen(false);
                router.refresh();
            } else if ('error' in result) {
                showToast(result.error || "Erro ao cancelar assinatura", "error");
            }
        } catch (error) {
            showToast("Erro ao processar solicitação", "error");
        } finally {
            setIsLoadingSubscription(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setIsLoadingSubscription(true);
        try {
            const result = await reactivateSubscriptionAction();
            if (result.success) {
                showToast("Assinatura reativada com sucesso!", "success");
                router.refresh();
            } else if ('error' in result) {
                showToast(result.error || "Erro ao reativar assinatura", "error");
            }
        } catch (error) {
            showToast("Erro ao processar solicitação", "error");
        } finally {
            setIsLoadingSubscription(false);
        }
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                title="Status da Assinatura"
                description="Controle seu nível de acesso e recursos disponíveis"
            />

            <div className="mt-6 space-y-6">
                {/* Plan Header - Suave Style */}
                <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-2xl transition-all duration-500 shadow-sm border ${isPro ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        {isPro ? <Crown size={24} strokeWidth={2} /> : <User size={24} strokeWidth={2} />}
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Plano {planDetails.label}</h2>
                            {isPro && (
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-sm">
                                    PRO
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-gray-100 rounded-md">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">
                                    {isActive ? 'Assinatura Ativa' : 'Assinatura Inativa'}
                                </span>
                            </div>
                            {isCanceled && (
                                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-tight bg-red-50/50 px-2 py-0.5 rounded-md border border-red-100/50">
                                    Expira em breve
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Usage Stats - Softened */}
                <div className="space-y-5 pt-2">
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recursos Utilizados</p>
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Building2 size={14} strokeWidth={2} className="text-gray-400" />
                                    Streamings Ativos
                                </h3>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {usage.streamings} <span className="text-gray-300 font-medium">/</span> {planDetails.maxStreamings === 0 ? '-' : (planDetails.maxStreamings === 9999 ? '∞' : planDetails.maxStreamings)}
                            </p>
                        </div>
                        {planDetails.maxStreamings > 0 && planDetails.maxStreamings < 9999 && (
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isPro ? 'bg-indigo-500' : 'bg-primary'}`}
                                    style={{ width: `${Math.min((usage.streamings / planDetails.maxStreamings) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 italic font-medium">
                            {isPro ? "Acesso ilimitado liberado para sua conta." : `Você ainda pode criar ${planDetails.maxStreamings - usage.streamings} streamings.`}
                        </p>
                    </div>

                    {/* Features Preview - Grid */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                        {planDetails.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50/50 rounded-xl transition-colors group">
                                <div className={`p-1 rounded-lg ${isPro ? 'bg-indigo-50 text-indigo-500' : 'bg-green-50 text-green-500'} group-hover:scale-110 transition-transform`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 leading-tight">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button - Refined */}
                <div className="pt-4 space-y-3">
                    {!isPro ? (
                        <button
                            onClick={() => router.push("/planos")}
                            className="w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group bg-primary text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-95"
                        >
                            <Crown size={18} strokeWidth={2} className="text-yellow-300 group-hover:rotate-6 transition-transform" />
                            <span className="tracking-tight text-sm">Fazer Upgrade para PRO</span>
                        </button>
                    ) : isCanceled ? (
                        <button
                            onClick={handleReactivateSubscription}
                            disabled={isLoadingSubscription}
                            className="w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                        >
                            {isLoadingSubscription ? "Processando..." : "Manter Plano Ativo"}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => router.push("/planos")}
                                className="h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95 text-sm"
                            >
                                Gerenciar Faturas
                            </button>
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="py-2 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest text-center"
                            >
                                Cancelar Assinatura
                            </button>
                        </div>
                    )}

                    <div className="flex justify-center flex-col items-center gap-1.5 pt-4">
                        {conta?.createdAt && (
                            <p className="text-[10px] text-gray-400 font-medium">
                                Membro desde {new Date(conta.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>
                </div>

                <CancelSubscriptionModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    onConfirm={handleCancelSubscription}
                    loading={isLoadingSubscription}
                />
            </div>
        </section>
    );
}
