"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Wallet } from "lucide-react";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { useMemo } from "react";
import { useActionError } from "@/hooks/useActionError";
import { SectionHeader } from "@/components/layout/SectionHeader";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useFaturasActions } from "@/hooks/useFaturasActions";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2, FileText, History, Table as TableIcon, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { getFaturasAnalytics } from "@/actions/faturas";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BatchActionBar } from "@/components/cobrancas/BatchActionBar";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { formatMesReferencia } from "@/lib/dateUtils";
import { sortByStatusPriority } from "@/lib/financeiro-utils";

const FaturasTable = dynamic(() => import("@/components/faturas/FaturasTable").then(mod => mod.FaturasTable), {
    loading: () => <TableSkeleton />
});

const LotesTab = dynamic(() => import("@/components/faturas/LotesTab").then(mod => mod.LotesTab), {
    loading: () => <TableSkeleton />
});

const DetalhesCobrancaModal = dynamic(() => import("@/components/modals/DetalhesCobrancaModal").then(mod => mod.DetalhesCobrancaModal));

const FinancialSummaryBanner = dynamic(() => import("@/components/faturas/FinancialSummaryBanner").then(mod => mod.FinancialSummaryBanner));

const FaturaCompositionDonut = dynamic(() => import("@/components/financeiro/charts/FaturaCompositionDonut").then(mod => mod.FaturaCompositionDonut), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const SavingsAccumulatedChart = dynamic(() => import("@/components/financeiro/charts/SavingsAccumulatedChart").then(mod => mod.SavingsAccumulatedChart), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const ServicePaymentHistoryBar = dynamic(() => import("@/components/financeiro/charts/ServicePaymentHistoryBar").then(mod => mod.ServicePaymentHistoryBar), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const PaymentVelocityChart = dynamic(() => import("@/components/financeiro/charts/PaymentVelocityChart").then(mod => mod.PaymentVelocityChart), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

interface FaturasClientProps {
    faturas: any[];
    resumo: any;
    lotes: any[];
    streamings: { id: number; nome: string; iconeUrl?: string | null; corPrimaria?: string | null }[];
    organizers: { id: number; nome: string }[];
    error?: string;
}

export function FaturasClient({
    faturas = [],
    resumo = {},
    lotes = [],
    streamings = [],
    organizers = [],
    error
}: FaturasClientProps) {
    const {
        faturasPendentes,
        faturasAguardando,
        viewMode,
        setViewMode,
        activeTabId,
        setActiveTabId,
        selectedFatura,
        selectedFaturaIds,
        setSelectedFaturaIds,
        clearSelection,
        isDetailsModalOpen,
        closeDetailsModal,
        isCreatingLote,
        handleCreateLote,
        handleViewDetails,
        filters,
        handleFilterChange,
        handleClearFilters,
    } = useFaturasActions(faturas, lotes);

    const filterConfig: FilterConfig[] = useMemo(() => [
        {
            key: "search",
            type: "text",
            placeholder: "Pesquisar faturas...",
            className: "flex-1 min-w-[200px]"
        },
        {
            key: "organizador",
            type: "select",
            label: "Organizador",
            emptyLabel: "Todos os Organizadores",
            className: "w-full md:w-[200px]",
            options: organizers.map(o => ({
                label: o.nome,
                value: o.id.toString()
            }))
        },
        {
            key: "streaming",
            type: "select",
            label: "Serviço",
            emptyLabel: "Todos os Serviços",
            className: "w-full md:w-[200px]",
            options: streamings.map(s => ({
                label: s.nome,
                value: s.id.toString(),
                iconNode: (
                    <StreamingLogo
                        name={s.nome}
                        iconeUrl={s.iconeUrl || ""}
                        color={s.corPrimaria || "#ccc"}
                        size="xs"
                        rounded="md"
                    />
                )
            }))
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            className: "w-full md:w-[150px]",
            options: [
                { label: "Pendentes", value: "pendente" },
                { label: "Aguardando", value: "aguardando_aprovacao" },
                { label: "Em Atraso", value: "atrasado" },
                { label: "Pagos", value: "pago" }
            ]
        },
        {
            key: "vencimento",
            type: "dateRange",
            label: "Vencimento",
            placeholder: "Filtrar por data"
        },
        {
            key: "valor",
            type: "numberRange",
            label: "Intervalo de Valor",
            placeholder: "Valor entre..."
        }
    ], [streamings, organizers]);

    useActionError(error);

    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (viewMode === "chart") {
            setLoadingAnalytics(true);
            getFaturasAnalytics("6m", {
                status: filters.statusFilter,
                streaming: filters.streamingFilter,
                q: filters.searchFilter,
                organizador: filters.organizadorFilter,
                vencimento: filters.vencimentoRange,
                valor: filters.valorRange
            }).then(res => {
                if (res.success) setAnalyticsData(res.data);
                setLoadingAnalytics(false);
            });
        }
    }, [viewMode, filters.statusFilter, filters.streamingFilter, filters.searchFilter, filters.organizadorFilter, filters.vencimentoRange, filters.valorRange]);

    const sortedFaturas = sortByStatusPriority(faturas);

    return (
        <PageContainer>
            <PageHeader
                title="Minhas Faturas"
                description="Veja suas cobranças pendentes e o histórico de pagamentos."
            />

            <div className="space-y-6 mt-6">

                {/* Financial Summary */}
                <FinancialSummaryBanner faturas={faturas} />

                <div className="mb-6">
                    <GenericFilter
                        filters={filterConfig}
                        values={{
                            status: filters.statusFilter,
                            streaming: filters.streamingFilter,
                            search: filters.searchFilter,
                            organizador: filters.organizadorFilter,
                            vencimento: filters.vencimentoRange,
                            valor: filters.valorRange
                        }}
                        onChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                <Tabs
                    value={activeTabId}
                    onValueChange={setActiveTabId}
                    tabs={[
                        {
                            id: "faturas",
                            label: "Faturas em Aberto",
                            icon: FileText,
                            content: (
                                <div className="space-y-6">
                                    <SectionHeader
                                        title="Minhas Cobranças"
                                        className="mb-0"
                                        rightElement={
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                                {faturasPendentes.length === 0 && faturasAguardando.length > 0 && (
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full text-center">
                                                        {faturasAguardando.length} em análise
                                                    </span>
                                                )}
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

                                    {faturas.length === 0 ? (
                                        <div className="py-8">
                                            <EmptyState
                                                icon={Wallet}
                                                title="Nenhuma fatura"
                                                description="Quando você participar de uma assinatura, as cobranças aparecerão aqui."
                                            />
                                        </div>
                                    ) : (
                                        viewMode === "chart" ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {loadingAnalytics ? (
                                                    <>
                                                        <Skeleton className="w-full h-[400px] rounded-[32px]" />
                                                        <Skeleton className="w-full h-[400px] rounded-[32px]" />
                                                    </>
                                                ) : analyticsData ? (
                                                    <>
                                                        {analyticsData.isStreamingFiltered ? (
                                                            <>
                                                                <ServicePaymentHistoryBar
                                                                    data={analyticsData.historyData}
                                                                />
                                                                <PaymentVelocityChart
                                                                    data={analyticsData.velocityData}
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaturaCompositionDonut
                                                                    data={analyticsData.compositionData}
                                                                    totalCurrentMonth={analyticsData.totalCurrentMonth}
                                                                />
                                                                <SavingsAccumulatedChart
                                                                    data={analyticsData.historyData}
                                                                />
                                                                <div className="lg:col-span-2">
                                                                    <PaymentVelocityChart
                                                                        data={analyticsData.velocityData}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 py-20 text-center text-gray-400">
                                                        Não foi possível carregar os gráficos.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <FaturasTable
                                                faturas={sortedFaturas}
                                                onViewDetails={handleViewDetails}
                                                selectedIds={selectedFaturaIds}
                                                onSelectChange={setSelectedFaturaIds}
                                            />
                                        )
                                    )}
                                </div>
                            )
                        },
                        {
                            id: "lotes",
                            label: "Histórico de Lotes",
                            icon: History,
                            content: (
                                <div className="space-y-6">
                                    <SectionHeader
                                        title="Meus Pagamentos Consolidados"
                                        className="mb-0"
                                    />
                                    <LotesTab lotes={lotes} viewMode={viewMode} />
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            <DetalhesCobrancaModal
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                cobranca={selectedFatura}
            />

            {/* Reusable Batch Selection Bar */}
            {activeTabId === "faturas" && (
                <BatchActionBar
                    count={selectedFaturaIds.length}
                    total={sortedFaturas.filter(f => selectedFaturaIds.includes(f.id)).reduce((acc, curr) => acc + Number(curr.valor), 0)}
                    isAdmin={false}
                    onPay={handleCreateLote}
                    onClear={clearSelection}
                    loading={isCreatingLote}
                    summaryItems={sortedFaturas
                        .filter(f => selectedFaturaIds.includes(f.id))
                        .map(f => ({
                            id: f.id,
                            title: f.assinatura?.streaming?.apelido || f.assinatura?.streaming?.catalogo?.nome || "Serviço",
                            description: `Org.: ${f.assinatura?.participante?.conta?.nome || "Desconhecido"} - Ref: ${formatMesReferencia(f.mesReferencia || f.periodoInicio || f.dataVencimento)}`,
                            value: Number(f.valor),
                            icon: (
                                <StreamingLogo
                                    name={f.assinatura?.streaming?.catalogo?.nome || "Icon"}
                                    iconeUrl={f.assinatura?.streaming?.catalogo?.iconeUrl}
                                    color={f.assinatura?.streaming?.catalogo?.corPrimaria}
                                    size="xs"
                                    rounded="md"
                                />
                            )
                        }))
                    }
                />
            )}
        </PageContainer>
    );
}
