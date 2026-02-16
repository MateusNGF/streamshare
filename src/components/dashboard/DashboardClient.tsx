"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { DashboardStreamingList } from "./DashboardStreamingList";
import { type StreamingFormData } from "@/components/modals/StreamingModal";
import { createStreaming } from "@/actions/streamings";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

// Sections
import { QuickActionsSection } from "./sections/QuickActionsSection";
import { DashboardAnalytics } from "./sections/DashboardAnalytics";
import { RecentSubscriptionsSection } from "./sections/RecentSubscriptionsSection";

const StreamingModal = dynamic(() => import("@/components/modals/StreamingModal").then(mod => mod.StreamingModal));
const AddMemberModal = dynamic(() => import("@/components/modals/AddMemberModal").then(mod => mod.AddMemberModal));

interface DashboardClientProps {
    stats: any;
    recentSubscriptions: any[];
    streamings: any[];
}

export function DashboardClient({ stats, recentSubscriptions, streamings }: DashboardClientProps) {
    const [isStreamingModalOpen, setIsStreamingModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { success, error } = useToast();

    // Psychological approach: Grouping info by priority
    // Primary Actions: Growth and Management
    const handleCreateStreaming = async (data: StreamingFormData) => {
        setLoading(true);
        try {
            await createStreaming({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });
            success("Streaming criado com sucesso!");
            setIsStreamingModalOpen(false);
            router.refresh();
        } catch (err: any) {
            error(err?.message || "Erro ao criar streaming");
        } finally {
            setLoading(false);
        }
    };

    // Data Preparation for Visualization - Memoized for performance
    const revenueHistory = useMemo(() => [
        { name: 'Jan', receita: stats.monthlyRevenue * 0.65, participantes: 12 },
        { name: 'Fev', receita: stats.monthlyRevenue * 0.78, participantes: 15 },
        { name: 'Mar', receita: stats.monthlyRevenue * 0.82, participantes: 18 },
        { name: 'Abr', receita: stats.monthlyRevenue * 0.92, participantes: 22 },
        { name: 'Mai', receita: stats.monthlyRevenue, participantes: stats.activeParticipantsCount },
    ], [stats.monthlyRevenue, stats.activeParticipantsCount]);

    const distributionData = useMemo(() => streamings.map(s => ({
        name: s.apelido || s.catalogo.nome,
        vagas: s.limiteParticipantes,
        ocupadas: s._count.assinaturas,
        color: s.catalogo.corPrimaria
    })).sort((a, b) => b.ocupadas - a.ocupadas).slice(0, 5), [streamings]);

    return (
        <div className="space-y-10 animate-fade-in pb-10">

            {/* 1. Quick Access (Cognitive ease - put common tools first) */}
            <QuickActionsSection
                onOpenStreamingModal={() => setIsStreamingModalOpen(true)}
                onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
            />

            {/* 2. KPIs & Advanced Analytics */}
            <DashboardAnalytics
                stats={stats}
                revenueHistory={revenueHistory}
                distributionData={distributionData}
            />

            {/* 3. Operational Data */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
                <div className="lg:col-span-3">
                    <DashboardStreamingList streamings={streamings} />
                </div>

                <div className="lg:col-span-2">
                    <RecentSubscriptionsSection recentSubscriptions={recentSubscriptions} />
                </div>
            </div>

            {/* Modals - Orchestration Layer */}
            <StreamingModal
                isOpen={isStreamingModalOpen}
                onClose={() => setIsStreamingModalOpen(false)}
                onSave={handleCreateStreaming}
                loading={loading}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                streamings={streamings}
            />
        </div>
    );
}
