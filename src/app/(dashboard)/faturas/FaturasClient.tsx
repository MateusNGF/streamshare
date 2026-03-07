"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Wallet } from "lucide-react";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { useActionError } from "@/hooks/useActionError";
import { SectionHeader } from "@/components/layout/SectionHeader";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useFaturasActions } from "@/hooks/useFaturasActions";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2, FileText, History } from "lucide-react";
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

const FaturaCard = dynamic(() => import("@/components/faturas/FaturaCard").then(mod => mod.FaturaCard), {
    loading: () => <LoadingCard variant="compact" />
});

const DetalhesCobrancaModal = dynamic(() => import("@/components/modals/DetalhesCobrancaModal").then(mod => mod.DetalhesCobrancaModal));

const FinancialSummaryBanner = dynamic(() => import("@/components/faturas/FinancialSummaryBanner").then(mod => mod.FinancialSummaryBanner));

interface FaturasClientProps {
    faturas: any[];
    resumo: any;
    lotes: any[];
    error?: string;
}

export function FaturasClient({ faturas, resumo, lotes, error }: FaturasClientProps) {
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
    } = useFaturasActions(faturas, lotes);

    useActionError(error);

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
                                        viewMode === "grid" ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {sortedFaturas.map((fatura) => (
                                                    <FaturaCard key={fatura.id} fatura={fatura} onConfirmPayment={handleViewDetails} onViewDetails={handleViewDetails} />
                                                ))}
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
                                        rightElement={
                                            <ViewModeToggle
                                                viewMode={viewMode}
                                                setViewMode={setViewMode}
                                            />
                                        }
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
