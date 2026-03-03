"use client";

import { Search, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";

interface ExploreEmptyStateProps {
    searchTerm?: string;
    userPlan?: string;
}

export function ExploreEmptyState({ searchTerm, userPlan = "free" }: ExploreEmptyStateProps) {
    const router = useRouter();
    const isFreePlan = userPlan === "free";

    const ActionButton = !isFreePlan ? (
        <Button
            onClick={() => router.push('/streamings?action=new')}
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-primary shadow-primary/20 hover:bg-accent mx-auto"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={20} />
                Seja o Organizador e Crie o Seu
            </span>
        </Button>
    ) : undefined;

    const EmptyDescription = (
        <>
            Nenhum resultado para <span className="font-semibold text-gray-700">"{searchTerm || "filtros selecionados"}"</span>.
            Mas as melhores oportunidades não se encontram, <span className="font-semibold text-primary/80 italic underline decoration-primary/20 underline-offset-4">se criam</span>.
        </>
    );

    return (
        <div className="space-y-8">
            <EmptyState
                icon={Search}
                title="Ops, o cofre está vazio!"
                description={EmptyDescription}
                action={ActionButton}
                variant="glass"
            />

            {isFreePlan && (
                <UpgradeBanner
                    variant="gold"
                    size="large"
                    title="Desbloqueie o Poder de ser um Organizador"
                    description="Como Organizador, você não apenas economiza, você lucra com a gestão. Upgrade para o plano Pro e crie seus próprios grupos de streaming hoje mesmo!"
                    buttonText="Upgrade para Pro"
                    buttonHref="/planos"
                    icon={Crown}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                />
            )}
        </div>
    );
}
