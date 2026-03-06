"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Wallet } from "lucide-react";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { useActionError } from "@/hooks/useActionError";
import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { criarLotePagamento } from "@/actions/cobrancas";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2, FileText, History } from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BatchActionBar } from "@/components/cobrancas/BatchActionBar";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { formatMesReferencia } from "@/lib/dateUtils";

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
    const faturasPendentesForTab = faturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
    const lotesPendentes = lotes.filter(l => l.status === 'pendente' || l.status === 'atrasado' || l.status === 'aguardando_aprovacao');

    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [activeTabId, setActiveTabId] = useState(() => (faturasPendentesForTab.length === 0 && lotesPendentes.length > 0) ? "lotes" : "faturas");
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [selectedFaturaIds, setSelectedFaturaIds] = useState<number[]>([]);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCreatingLote, setIsCreatingLote] = useState(false);
    const router = useRouter();
    const toast = useToast();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get("tab");
        const loteId = searchParams.get("loteId");

        if (tab === "lotes") {
            setActiveTabId("lotes");
        }

        if (loteId && lotes.length > 0) {
            const lote = lotes.find(l => l.id === Number(loteId));
            if (lote) {
                // Se encontrar o lote por ID, garante que está na aba certa e abre o modal (simulado selecionando para o LotesTab)
                setActiveTabId("lotes");
                // Nota: O LotesTab precisaria de uma forma de receber esse lote selecionado ou o FaturasClient gerenciar o modal de lote.
                // Atualmente o LotesTab gerencia seu próprio selectedLote. 
                // Vamos mover o gerenciamento do ModalPagamentoLote para o FaturasClient para unificar.
            }
        }
    }, [searchParams, lotes]);

    useActionError(error);

    // Only pendente/atrasado are payable - aguardando_aprovacao already has a comprovante being reviewed
    const faturasPendentes = faturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
    const faturasAguardando = faturas.filter(f => f.status === 'aguardando_aprovacao');

    const handleCreateLote = async () => {
        if (selectedFaturaIds.length === 0) return;
        setIsCreatingLote(true);
        try {
            const result = await criarLotePagamento(selectedFaturaIds);
            if (result.success && result.data) {
                toast.success("Lote criado com sucesso! Redirecionando...");
                setSelectedFaturaIds([]);
                // Refresh data and switch to lotes tab with the new lote ID
                router.refresh();
                router.push(`/faturas?tab=lotes&loteId=${result.data.id}`);
            } else {
                toast.error(result.error || "Erro ao criar lote.");
            }
        } catch (err) {
            toast.error("Erro inesperado ao criar lote.");
        } finally {
            setIsCreatingLote(false);
        }
    };

    const handleViewDetails = (id: number) => {
        const fatura = faturas.find(f => f.id === id);
        setSelectedFatura(fatura);
        setIsDetailsModalOpen(true);
    };

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
                                                {faturas.map((fatura) => (
                                                    <FaturaCard key={fatura.id} fatura={fatura} onConfirmPayment={handleViewDetails} onViewDetails={handleViewDetails} />
                                                ))}
                                            </div>
                                        ) : (
                                            <FaturasTable
                                                faturas={faturas}
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
                onClose={() => setIsDetailsModalOpen(false)}
                cobranca={selectedFatura}
            />

            {/* Reusable Batch Selection Bar */}
            {activeTabId === "faturas" && (
                <BatchActionBar
                    count={selectedFaturaIds.length}
                    total={faturas.filter(f => selectedFaturaIds.includes(f.id)).reduce((acc, curr) => acc + Number(curr.valor), 0)}
                    isAdmin={false}
                    onPay={handleCreateLote}
                    onClear={() => setSelectedFaturaIds([])}
                    loading={isCreatingLote}
                    summaryItems={faturas
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
