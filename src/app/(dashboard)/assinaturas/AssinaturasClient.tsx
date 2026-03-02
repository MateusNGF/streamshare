"use client";

import { Plus, Search, Users, Activity, TrendingUp } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useActionError } from "@/hooks/useActionError";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { FilterConfig } from "@/components/ui/GenericFilter";
import { useAssinaturasActions } from "@/hooks/useAssinaturasActions";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";

const GenericFilter = dynamic(() => import("@/components/ui/GenericFilter").then(mod => mod.GenericFilter), {
    loading: () => <Skeleton className="w-full h-16 rounded-2xl" />
});

const KPIFinanceiroCard = dynamic(() => import("@/components/dashboard/KPIFinanceiroCard").then(mod => mod.KPIFinanceiroCard), {
    loading: () => <Skeleton className="w-full h-32 rounded-[32px]" />
});

const AssinaturasTable = dynamic(() => import("@/components/assinaturas/AssinaturasTable").then(mod => mod.AssinaturasTable), {
    loading: () => <TableSkeleton />
});

const AssinaturaCard = dynamic(() => import("@/components/assinaturas/AssinaturaCard").then(mod => mod.AssinaturaCard), {
    loading: () => <LoadingCard variant="compact" />
});

const AssinaturasModals = dynamic(() => import("@/components/assinaturas/AssinaturasModals").then(mod => mod.AssinaturasModals));

interface AssinaturasClientProps {
    initialSubscriptions: any[];
    participantes: any[];
    streamings: any[];
    kpis: {
        totalAtivas: number;
        totalSuspensas: number;
        receitaMensalEstimada: number;
        totalAssinaturas: number;
    };
    plano: PlanoConta;
    error?: string;
}

export default function AssinaturasClient({
    initialSubscriptions,
    participantes,
    streamings,
    kpis,
    plano,
    error
}: AssinaturasClientProps) {
    useActionError(error);
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const {
        isMultipleModalOpen, setIsMultipleModalOpen,
        cancelModalOpen, setCancelModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedAssinatura, setSelectedAssinatura,
        loading, cancelling,
        filters: filterValues,
        handleFilterChange,
        handleClearFilters,
        handleCreateMultiple,
        handleCancelSubmit,
        streamingsWithOcupados
    } = useAssinaturasActions(streamings);

    const filterConfig: FilterConfig[] = useMemo(() => [
        {
            key: "search",
            type: "text",
            placeholder: "Buscar participante...",
            className: "flex-1 min-w-[200px]"
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            className: "w-full md:w-[150px]",
            options: [
                { label: "Ativas", value: "ativa" },
                { label: "Suspensas", value: "suspensa" },
                { label: "Canceladas", value: "cancelada" }
            ]
        },
        {
            key: "streaming",
            type: "select",
            label: "Streaming",
            className: "w-full md:w-[200px]",
            options: streamings.map(s => ({
                label: s.apelido || s.catalogo.nome,
                value: s.id.toString(),
                icon: s.catalogo.iconeUrl,
                color: s.catalogo.corPrimaria
            }))
        },
        {
            key: "criacao",
            type: "dateRange",
            label: "Data de Início",
            placeholder: "Filtrar por data"
        },
        {
            key: "valor",
            type: "numberRange",
            label: "Intervalo de Valor",
            placeholder: "Valor entre..."
        },
        {
            key: "hasWhatsapp",
            type: "switch",
            label: "Apenas com WhatsApp",
            className: "md:w-auto"
        }
    ], [streamings]);

    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes e monitore a receita."
                action={
                    <Button
                        onClick={() => setIsMultipleModalOpen(true)}
                        className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nova Assinatura</span>
                        <span className="sm:hidden">Nova</span>
                    </Button>
                }
            />

            <KPIGrid cols={4} className="mb-4">
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Receita Estimada"
                        valor={kpis.receitaMensalEstimada}
                        icone={TrendingUp}
                        cor="primary"
                        index={0}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Assinaturas Ativas"
                        valor={kpis.totalAtivas}
                        icone={Activity}
                        cor="green"
                        isMoeda={false}
                        index={1}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Suspensas"
                        valor={kpis.totalSuspensas}
                        icone={Users}
                        cor="red"
                        isMoeda={false}
                        index={2}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Total Histórico"
                        valor={kpis.totalAssinaturas}
                        icone={Users}
                        cor="primary"
                        isMoeda={false}
                        index={3}
                    />
                </KPIGridItem>
            </KPIGrid>

            <div className="py-6">
                <GenericFilter
                    filters={filterConfig}
                    values={{
                        search: filterValues.searchTerm,
                        status: filterValues.statusFilter,
                        streaming: filterValues.streamingFilter,
                        criacao: filterValues.criacaoRange || "",
                        valor: filterValues.valorRange || "",
                        hasWhatsapp: filterValues.hasWhatsappFilter || "false"
                    }}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            <div className="space-y-4">
                <SectionHeader
                    title="Listagem de Assinaturas"
                    className="mb-0"
                    rightElement={
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    }
                />
                {!FeatureGuards.isFeatureEnabled(plano, "automatic_billing").enabled && (
                    <UpgradeBanner
                        variant="glass"
                        size="normal"
                        title="Gestão de Assinaturas Inteligente"
                        description="Automatize o controle de períodos e receba alertas de renovação para nunca perder o prazo."
                        className="mb-8"
                    />
                )}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4">
                        {initialSubscriptions.map((sub) => (
                            <AssinaturaCard
                                key={sub.id}
                                sub={sub}
                                onViewDetails={() => {
                                    setSelectedAssinatura(sub);
                                    setDetailsModalOpen(true);
                                }}
                                onCancel={() => {
                                    setSelectedAssinatura(sub);
                                    setCancelModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <AssinaturasTable
                        subscriptions={initialSubscriptions}
                        onViewDetails={(sub) => {
                            setSelectedAssinatura(sub);
                            setDetailsModalOpen(true);
                        }}
                        onCancel={(sub) => {
                            setSelectedAssinatura(sub);
                            setCancelModalOpen(true);
                        }}
                    />
                )}
            </div>

            <AssinaturasModals
                isMultipleModalOpen={isMultipleModalOpen}
                onCloseMultiple={() => setIsMultipleModalOpen(false)}
                onSaveMultiple={handleCreateMultiple}
                loading={loading}
                participantes={participantes}
                streamingsWithOcupados={streamingsWithOcupados}
                cancelModalOpen={cancelModalOpen}
                onCloseCancel={() => {
                    setCancelModalOpen(false);
                    setSelectedAssinatura(null);
                }}
                onConfirmCancel={handleCancelSubmit}
                cancelling={cancelling}
                selectedAssinatura={selectedAssinatura}
                detailsModalOpen={detailsModalOpen}
                onCloseDetails={() => {
                    setDetailsModalOpen(false);
                    setSelectedAssinatura(null);
                }}
            />
        </PageContainer>
    );
}
