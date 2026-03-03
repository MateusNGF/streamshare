"use client";

import { Search, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { useRouter } from "next/navigation";

interface ExploreEmptyStateProps {
    searchTerm?: string;
    userPlan?: string;
}

export function ExploreEmptyState({ searchTerm, userPlan = "free" }: ExploreEmptyStateProps) {
    const router = useRouter();
    const isFreePlan = userPlan === "free";

    return (
        <div className="space-y-8">
            <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200 shadow-inner overflow-hidden relative">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <Search size={40} className="relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    Ops, o cofre está vazio!
                </h3>

                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                    Nenhum resultado para <span className="font-semibold text-gray-700">"{searchTerm || "filtros selecionados"}"</span>.
                    Mas as melhores oportunidades não se encontram, <span className="font-semibold text-primary/80 italic underline decoration-primary/20 underline-offset-4">se criam</span>.
                </p>

                {!isFreePlan && (
                    <Button
                        onClick={() => router.push('/streamings?action=new')}
                        className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-primary shadow-primary/20 hover:bg-accent mx-auto"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 flex items-center gap-2">
                            <Sparkles size={20} />
                            Seja o Host e Crie o Seu
                        </span>
                    </Button>
                )}
            </div>

            {isFreePlan && (
                <UpgradeBanner
                    variant="gold"
                    size="large"
                    title="Desbloqueie o Poder de ser um Host"
                    description="Como Host, você não apenas economiza, você lucra com a gestão. Upgrade para o plano Pro e crie seus próprios grupos de streaming hoje mesmo!"
                    buttonText="Upgrade para Pro"
                    buttonHref="/planos"
                    icon={Crown}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                />
            )}
        </div>
    );
}
