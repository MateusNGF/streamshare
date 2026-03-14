"use client";

import { DollarSign, CheckCircle, AlertCircle, FileStack, ChevronRight, FileText, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useRouter } from "next/navigation";
import { useActionError } from "@/hooks/useActionError";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getCobrancasAnalytics } from "@/actions/cobrancas";
import { Table as TableIcon, BarChart3 } from "lucide-react";
import { ConsolidarFaturasModal } from "@/components/modals/ConsolidarFaturasModal";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { formatMesReferencia } from "@/lib/dateUtils";
import { getCobrancasFilterConfig } from "@/components/cobrancas/filters/CobrancasFilterConfig";
import { ChartContainerSkeleton, BarChartSkeleton, StackedBarChartSkeleton } from "@/components/financeiro/charts/ChartSkeletons";

const LotesTab = dynamic(() => import("@/components/faturas/LotesTab").then(mod => mod.LotesTab), {
    loading: () => <TableSkeleton />
});

const GenericFilter = dynamic(() => import("@/components/ui/GenericFilter").then(mod => mod.GenericFilter), {
    loading: () => <Skeleton className="w-full h-16 rounded-2xl" />
});

const KPIFinanceiroCard = dynamic(() => import("@/components/dashboard/KPIFinanceiroCard").then(mod => mod.KPIFinanceiroCard), {
    loading: () => <Skeleton className="w-full h-32 rounded-[32px]" />
});

const CobrancasTable = dynamic(() => import("@/components/cobrancas/CobrancasTable").then(mod => mod.CobrancasTable), {
    loading: () => <TableSkeleton />
});

const CobrancasModals = dynamic(() => import("@/components/cobrancas/CobrancasModals").then(mod => mod.CobrancasModals));
const BatchActionBar = dynamic(() => import("@/components/cobrancas/BatchActionBar").then(mod => mod.BatchActionBar), { ssr: false });

const CobrancasStatusDonut = dynamic(() => import("@/components/financeiro/charts/CobrancasStatusDonut").then(mod => mod.CobrancasStatusDonut), {
    ssr: false,
    loading: () => <ChartContainerSkeleton title="Status do Ciclo" />
});

const CobrancasHistoryStackedBar = dynamic(() => import("@/components/financeiro/charts/CobrancasHistoryStackedBar").then(mod => mod.CobrancasHistoryStackedBar), {
    ssr: false,
    loading: () => <StackedBarChartSkeleton title="Histórico de Inadimplência" />
});

const CobrancasByServiceBar = dynamic(() => import("@/components/financeiro/charts/CobrancasByServiceBar").then(mod => mod.CobrancasByServiceBar), {
    ssr: false,
    loading: () => <BarChartSkeleton title="Inadimplência por Serviço" />
});

const ParticipantHistoryLine = dynamic(() => import("@/components/financeiro/charts/ParticipantHistoryLine").then(mod => mod.ParticipantHistoryLine), {
    ssr: false,
    loading: () => <ChartContainerSkeleton title="Histórico do Participante" />
});


interface CobrancasClientProps {
    kpis: {
        totalPendente: number;
        receitaConfirmada: number;
        emAtraso: number;
        totalCobrancas: number;
    };
    cobrancasIniciais: any[];
    lotes: any[];
    whatsappConfigurado: boolean;
    streamings: any[];
    participantes: any[];
    plano: PlanoConta;
    error?: string;
}

export function CobrancasClient({ kpis, cobrancasIniciais, lotes, whatsappConfigurado, streamings, participantes, plano, error }: CobrancasClientProps) {
    const router = useRouter();
    useActionError(error);
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [consolidateModalOpen, setConsolidateModalOpen] = useState(false);
    const {
        filters,
        handleFilterChange,
        handleClearFilters,
        loading,
        whatsappLoading,
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedCobranca,
        filteredCobrancas,
        handleConfirmarPagamento,
        executePaymentConfirmation,
        handleCancelarCobranca,
        confirmCancellation,
        handleEnviarWhatsApp,
        handleViewQrCode,
        qrModalOpen, setQrModalOpen,
        setSelectedCobrancaId,
        selectedIds, toggleSelection, selectAll, clearSelection,
        batchTotal, hasMixedParticipants, activeLote, batchPixModalOpen, setBatchPixModalOpen,
        handleAbrirLote, handleConfirmarLoteAdmin, handleEnviarWhatsAppLote
    } = useCobrancasActions(cobrancasIniciais);

    const [activeTabId, setActiveTabId] = useState("cobrancas");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Otimização Senior: Handler memoizado para evitar re-renders em cascata nos gráficos
    const handleSliceClick = useCallback((status: string) => {
        handleFilterChange("status", status);
        setViewMode("table");
        // UX: Scroll suave para a tabela após filtrar pelo gráfico
        setTimeout(() => {
            const tableElement = document.getElementById('cobrancas-list-section');
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 400, behavior: 'smooth' });
            }
        }, 150);
    }, [handleFilterChange]);

    // Analytics Contextual com Proteção contra Race Conditions
    useEffect(() => {
        if (viewMode !== "chart") return;

        let isMounted = true;
        setLoadingAnalytics(true);

        const fetchAnalytics = async () => {
            const res = await getCobrancasAnalytics("6m", {
                searchTerm: filters.searchTerm,
                status: filters.statusFilter,
                participante: filters.participanteFilter,
                streaming: filters.streamingFilter,
                mesReferencia: filters.mesReferencia
            });

            if (isMounted) {
                if (res.success) {
                    setAnalyticsData(res.data);
                }
                setLoadingAnalytics(false);
            }
        };

        fetchAnalytics();

        return () => {
            isMounted = false;
        };
    }, [viewMode, filters.searchTerm, filters.statusFilter, filters.participanteFilter, filters.streamingFilter, filters.mesReferencia]);

    const whatsappCheck = FeatureGuards.isFeatureEnabled(plano, "whatsapp_integration");
    const automaticBillingCheck = FeatureGuards.isFeatureEnabled(plano, "automatic_billing");

    const pendingApprovalsCount = useMemo(() =>
        cobrancasIniciais.filter(c => c.status === 'aguardando_aprovacao').length,
        [cobrancasIniciais]);

    const monthOptions = useMemo(() => {
        return Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            };
        });
    }, []);

    const filterConfig = useMemo(() => getCobrancasFilterConfig({
        participantes,
        streamings,
        monthOptions
    }), [participantes, streamings, monthOptions]);

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            {pendingApprovalsCount > 0 && (
                <div
                    className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-blue-100 transition-colors animate-in fade-in slide-in-from-top-4"
                    onClick={() => {
                        handleFilterChange("status", "aguardando_aprovacao");
                        setTimeout(() => window.scrollTo({ top: 400, behavior: 'smooth' }), 100);
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FileStack size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-lg">Faturas a Aguardar Validação ({pendingApprovalsCount})</h4>
                            <p className="text-sm text-blue-700">Participantes enviaram comprovantes que precisam da sua aprovação.</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-700 bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                        Ver Faturas
                        <ChevronRight size={16} />
                    </div>
                </div>
            )}

            <KPIGrid cols={3} >
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Total a Receber"
                        valor={kpis.totalPendente}
                        icone={DollarSign}
                        cor="primary"
                        index={0}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Receita Confirmada"
                        valor={kpis.receitaConfirmada}
                        icone={CheckCircle}
                        cor="green"
                        index={1}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Em Atraso"
                        valor={kpis.emAtraso}
                        icone={AlertCircle}
                        cor="red"
                        index={2}
                    />
                </KPIGridItem>
            </KPIGrid>

            <div className="py-6">
                <GenericFilter
                    filters={filterConfig}
                    values={{
                        search: filters.searchTerm,
                        participante: filters.participanteFilter,
                        status: filters.statusFilter,
                        streaming: filters.streamingFilter,
                        mesReferencia: filters.mesReferencia,
                        vencimento: filters.vencimentoRange || "",
                        pagamento: filters.pagamentoRange || "",
                        valor: filters.valorRange || "",
                        hasWhatsapp: filters.hasWhatsappFilter || "false"
                    }}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />

                {/* Acessibilidade: Região aria-live para anunciar resultados de filtros */}
                <div
                    className="sr-only"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {filteredCobrancas.length} {filteredCobrancas.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </div>
            </div>

            <Tabs
                value={activeTabId}
                onValueChange={setActiveTabId}
                tabs={[
                    {
                        id: "cobrancas",
                        label: "Cobranças em Aberto",
                        icon: FileText,
                        content: (
                            <div className="space-y-4 relative mt-2">
                                <SectionHeader
                                    title="Listagem de Cobranças"
                                    className="mb-0"
                                    rightElement={
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 flex-1 justify-center sm:flex-none"
                                                onClick={() => setConsolidateModalOpen(true)}
                                            >
                                                <FileStack size={16} className="mr-2 hidden sm:block" />
                                                <span className="sm:hidden text-center w-full">Agrupar Pendências Únicas</span>
                                                <span className="hidden sm:inline">Gerar Faturas do Mês</span>
                                            </Button>
                                            <div className="flex-1 w-full sm:w-auto flex justify-center">
                                                <ViewModeToggle
                                                    viewMode={viewMode}
                                                    setViewMode={setViewMode}
                                                    options={[
                                                        { id: "table", label: "Tabela", icon: TableIcon },
                                                        { id: "chart", label: "Análise", icon: BarChart3 },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    }
                                />

                                {!whatsappCheck.enabled && (
                                    <UpgradeBanner
                                        title="Automatize suas cobranças via WhatsApp"
                                        description="No plano Business, o sistema envia cobranças automaticamente para você."
                                        className="mb-4"
                                    />
                                )}

                                {viewMode === "chart" ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {loadingAnalytics ? (
                                            <>
                                                {analyticsData?.isParticipantFiltered ? (
                                                    <ChartContainerSkeleton title="Histórico do Participante" />
                                                ) : (
                                                    <BarChartSkeleton title="Inadimplência por Serviço" />
                                                )}
                                                <ChartContainerSkeleton title="Status do Ciclo" />
                                                {!analyticsData?.isParticipantFiltered && (
                                                    <div className="lg:col-span-2">
                                                        <StackedBarChartSkeleton title="Histórico de Inadimplência" />
                                                    </div>
                                                )}
                                            </>
                                        ) : analyticsData ? (
                                            <>
                                                {analyticsData.isParticipantFiltered ? (
                                                    <>
                                                        <ParticipantHistoryLine
                                                            data={analyticsData.historyData}
                                                        />
                                                        <CobrancasStatusDonut
                                                            data={analyticsData.donutData}
                                                            totalExpected={analyticsData.totalExpected}
                                                            monthLabel={analyticsData.monthLabel}
                                                            onSliceClick={handleSliceClick}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <CobrancasByServiceBar
                                                            data={analyticsData.serviceRanking}
                                                        />
                                                        <CobrancasStatusDonut
                                                            data={analyticsData.donutData}
                                                            totalExpected={analyticsData.totalExpected}
                                                            monthLabel={analyticsData.monthLabel}
                                                            onSliceClick={handleSliceClick}
                                                        />
                                                        <div className="lg:col-span-2">
                                                            <CobrancasHistoryStackedBar
                                                                data={analyticsData.historyData}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="col-span-2 py-20 text-center">
                                                <p className="text-gray-500">Não foi possível carregar os dados analíticos.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div id="cobrancas-list-section">
                                        <CobrancasTable
                                            cobrancas={filteredCobrancas}
                                            onViewDetails={(id) => {
                                                setSelectedCobrancaId(id);
                                                setDetailsModalOpen(true);
                                            }}
                                            onConfirmPayment={handleConfirmarPagamento}
                                            onSendWhatsApp={handleEnviarWhatsApp}
                                            onCancelPayment={handleCancelarCobranca}
                                            searchTerm={filters.searchTerm}
                                            statusFilter={filters.statusFilter}
                                            onViewQrCode={handleViewQrCode}
                                            selectedIds={selectedIds}
                                            onToggleSelect={toggleSelection}
                                            onSelectAll={selectAll}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    },
                    {
                        id: "lotes",
                        label: "Lotes Consolidados",
                        icon: History,
                        content: (
                            <div className="space-y-6 mt-2">
                                <SectionHeader
                                    title="Lotes de Cobrança"
                                    className="mb-0"
                                    rightElement={
                                        <ViewModeToggle
                                            viewMode={viewMode}
                                            setViewMode={setViewMode}
                                            options={[
                                                { id: "table", label: "Tabela", icon: TableIcon },
                                                { id: "chart", label: "Análise", icon: BarChart3 },
                                            ]}
                                        />
                                    }
                                />
                                <LotesTab lotes={lotes} viewMode={viewMode} isAdmin={true} />
                            </div>
                        )
                    }
                ]}
            />

            {activeTabId === "cobrancas" && (
                <BatchActionBar
                    count={selectedIds.size}
                    total={batchTotal}
                    isAdmin={true}
                    onPay={() => setIsConfirmModalOpen(true)}
                    onClear={clearSelection}
                    loading={loading}
                    hasMixedParticipants={hasMixedParticipants}
                    summaryItems={filteredCobrancas
                        .filter(c => selectedIds.has(c.id))
                        .map(c => ({
                            id: c.id,
                            title: c.assinatura?.streaming?.apelido || c.assinatura?.streaming?.catalogo?.nome || "Serviço",
                            description: `Parc.: ${c.assinatura?.participante?.nome} - Ref: ${formatMesReferencia(c.mesReferencia || c.periodoInicio || c.dataVencimento)}`,
                            value: Number(c.valor),
                            icon: (
                                <StreamingLogo
                                    name={c.assinatura?.streaming?.catalogo?.nome || "Icon"}
                                    iconeUrl={c.assinatura?.streaming?.catalogo?.iconeUrl}
                                    color={c.assinatura?.streaming?.catalogo?.corPrimaria}
                                    size="xs"
                                    rounded="md"
                                />
                            )
                        }))
                    }
                />
            )
            }

            {/* BatchPreviewDrawer was here */}

            <CobrancasModals
                cancelModalOpen={cancelModalOpen}
                onCloseCancel={() => setCancelModalOpen(false)}
                onConfirmCancel={confirmCancellation}
                confirmPaymentModalOpen={confirmPaymentModalOpen}
                onCloseConfirmPayment={() => setConfirmPaymentModalOpen(false)}
                onConfirmPayment={executePaymentConfirmation}
                detailsModalOpen={detailsModalOpen}
                onCloseDetails={() => {
                    setDetailsModalOpen(false);
                    setSelectedCobrancaId(null);
                }}
                selectedCobranca={selectedCobranca}
                loading={loading}
                qrModalOpen={qrModalOpen}
                onCloseQrModal={() => setQrModalOpen(false)}
                batchPixModalOpen={batchPixModalOpen}
                onCloseBatchPix={() => setBatchPixModalOpen(false)}
                activeLote={activeLote}
                isAdmin={true}
                confirmGerarLoteModalOpen={isConfirmModalOpen}
                onCloseConfirmGerarLote={() => setIsConfirmModalOpen(false)}
                onConfirmGerarLote={async () => {
                    const success = await handleAbrirLote();
                    if (success) setIsConfirmModalOpen(false);
                }}
                batchCount={selectedIds.size}
                batchTotal={batchTotal}
                batchItems={filteredCobrancas.filter(c => selectedIds.has(c.id))}
            />
            <ConsolidarFaturasModal
                isOpen={consolidateModalOpen}
                onClose={() => setConsolidateModalOpen(false)}
                mesReferencia={filters.mesReferencia}
            />
        </PageContainer>
    );
}
