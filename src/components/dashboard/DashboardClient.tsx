"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { type StreamingFormData } from "@/components/modals/StreamingModal";
import { createStreaming, upsertStreamingCredentials } from "@/actions/streamings";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useActionError } from "@/hooks/useActionError";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";

const QuickActionsSection = dynamic(() => import("./sections/QuickActionsSection").then(mod => mod.QuickActionsSection), {
    loading: () => <Skeleton className="w-full h-32 rounded-[32px]" />
});

const DashboardAnalytics = dynamic(() => import("./sections/DashboardAnalytics").then(mod => mod.DashboardAnalytics), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const RecentSubscriptionsSection = dynamic(() => import("./sections/RecentSubscriptionsSection").then(mod => mod.RecentSubscriptionsSection), {
    loading: () => <div className="space-y-4">{[1, 2, 3].map(i => <LoadingCard key={i} variant="compact" />)}</div>
});

const DashboardStreamingList = dynamic(() => import("./DashboardStreamingList").then(mod => mod.DashboardStreamingList), {
    loading: () => <TableSkeleton />
});

const StreamingModal = dynamic(() => import("@/components/modals/StreamingModal").then(mod => mod.StreamingModal));
const AddMemberModal = dynamic(() => import("@/components/modals/AddMemberModal").then(mod => mod.AddMemberModal));

import { DashboardStats, RevenueHistory, ParticipantStats, ParticipantSubscription } from "@/types/dashboard.types";
import { ParticipantDashboardClient } from "./ParticipantDashboardClient";
import { Users2, UserRound, LayoutDashboard, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardClientProps {
    stats: DashboardStats | null;
    recentSubscriptions: any[];
    streamings: any[];
    revenueHistory: RevenueHistory[];
    participantStats: ParticipantStats | null;
    participantSubscriptions: ParticipantSubscription[];
    pendingLotesCount?: number;
    initialView?: "provider" | "participant";
    hideSwitcher?: boolean;
    error?: string;
}

export function DashboardClient({
    stats,
    recentSubscriptions,
    streamings,
    revenueHistory,
    participantStats,
    participantSubscriptions,
    pendingLotesCount = 0,
    initialView = "provider",
    hideSwitcher = false,
    error: initialError
}: DashboardClientProps) {
    const [view, setView] = useState<"provider" | "participant">(initialView);
    useActionError(initialError);
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
            const result = await createStreaming({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });
            if (result.success && result.data) {
                // Save credentials if provided
                if (data.credLogin || data.credSenha) {
                    await upsertStreamingCredentials(result.data.id, {
                        login: data.credLogin || null,
                        senha: data.credSenha || null,
                    });
                }
                success("Streaming criado com sucesso!");
                setIsStreamingModalOpen(false);
                router.refresh();
            } else if (result.error) {
                error(result.error);
            }
        } catch (err: any) {
            error(err?.message || "Erro ao criar streaming");
        } finally {
            setLoading(false);
        }
    };


    const distributionData = useMemo(() => streamings.map(s => ({
        name: s.apelido || s.catalogo.nome,
        vagas: s.limiteParticipantes,
        ocupadas: s._count.assinaturas,
        color: s.catalogo.corPrimaria
    })).sort((a, b) => b.ocupadas - a.ocupadas).slice(0, 5), [streamings]);

    return (
        <div className="space-y-8 animate-slide-in-from-bottom pb-10">
            {/* View Switcher - Premium Segmented Control */}
            {!hideSwitcher && (
                <div className="flex justify-center md:justify-start">
                    <div className="bg-white/60 backdrop-blur-xl p-1.5 rounded-[24px] flex items-center gap-1 border border-white/40 shadow-xl shadow-black/5 ring-1 ring-black/[0.03]">
                        <button
                            onClick={() => setView("provider")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-black transition-all duration-300 ${view === "provider"
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">Visão Provedor</span>
                            <span className="sm:hidden">Provedor</span>
                        </button>
                        <button
                            onClick={() => setView("participant")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-sm font-black transition-all duration-300 ${view === "participant"
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <UserRound size={16} />
                            <span className="hidden sm:inline">Visão Participante</span>
                            <span className="sm:hidden">Meu Painel</span>
                        </button>
                    </div>
                </div>
            )}

            {view === "participant" ? (
                <ParticipantDashboardClient
                    stats={participantStats}
                    subscriptions={participantSubscriptions}
                />
            ) : (
                <div className="space-y-10 animate-fade-in">
                    {pendingLotesCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors shadow-sm" onClick={() => router.push('/cobrancas?status=aguardando_aprovacao')}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-amber-900 font-bold text-sm">Ação Necessária</h3>
                                    <p className="text-amber-700 text-xs">
                                        Você tem <strong>{pendingLotesCount}</strong> {pendingLotesCount === 1 ? 'lote de pagamento' : 'lotes de pagamento'} aguardando aprovação manual.
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-900 hover:bg-amber-200" onClick={() => router.push('/cobrancas?status=aguardando_aprovacao')}>
                                Avaliar Agora <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    )}

                    {/* 1. Quick Access (Cognitive ease - put common tools first) */}
                    <QuickActionsSection
                        onOpenStreamingModal={() => setIsStreamingModalOpen(true)}
                        onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
                    />

                    {/* 2. KPIs & Advanced Analytics */}
                    {stats ? (
                        <DashboardAnalytics
                            stats={stats}
                            revenueHistory={revenueHistory}
                            distributionData={distributionData}
                        />
                    ) : (
                        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-dashed border-gray-200 text-center">
                            <p className="text-gray-500">Falha ao carregar métricas de análise.</p>
                        </div>
                    )}

                    {/* 3. Operational Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
                        <div className="lg:col-span-3">
                            <DashboardStreamingList streamings={streamings} />
                        </div>

                        <div className="lg:col-span-2">
                            <RecentSubscriptionsSection recentSubscriptions={recentSubscriptions} />
                        </div>
                    </div>
                </div>
            )}

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
