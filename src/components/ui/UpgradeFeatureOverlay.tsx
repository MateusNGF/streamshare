"use client";

import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlanoConta } from "@prisma/client";
import { PLANS } from "@/config/plans";
import Link from "next/link";

interface UpgradeFeatureOverlayProps {
    requiredPlan: PlanoConta;
    featureName: string;
    className?: string;
}

export function UpgradeFeatureOverlay({
    requiredPlan,
    featureName,
    className = ""
}: UpgradeFeatureOverlayProps) {
    const planInfo = PLANS[requiredPlan];

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center rounded-[inherit] overflow-hidden ${className}`}>
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md border border-white/20" />

            {/* Content */}
            <div className="relative z-10 animate-fade-in flex flex-col items-center">
                <div className="bg-white/90 p-4 rounded-3xl shadow-xl mb-6 border border-gray-100 transform -rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Lock size={32} className="text-primary animate-pulse" />
                </div>

                <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                    {featureName}
                </h4>

                <p className="text-sm text-gray-600 mb-8 max-w-[280px] font-medium leading-relaxed">
                    Este recurso está disponível exclusivamente para membros do plano
                    <span className="text-primary font-bold"> {planInfo.label}</span>.
                </p>

                <Link href="/planos">
                    <Button className="gap-2 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:scale-105 active:scale-95 transition-all px-8 py-6">
                        <Crown size={18} className="fill-white" />
                        Fazer Upgrade Agora
                    </Button>
                </Link>

                <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    A partir de R$ {planInfo.price.toString().replace('.', ',')}/mês
                </p>
            </div>
        </div>
    );
}
