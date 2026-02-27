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
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [activeTabId, setActiveTabId] = useState("faturas");
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
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
    const faturasPendentes = faturas.filter(f => f.status === 'pendente' || f.status === 'atrasado');
    const faturasAguardando = faturas.filter(f => f.status === 'aguardando_aprovacao');

    const handlePayAll = async () => {
        if (faturasPendentes.length === 0) return;
        setIsCreatingLote(true);
        try {
            const ids = faturasPendentes.map(f => f.id);
            const result = await criarLotePagamento(ids);
            if (result.success && result.data) {
                toast.success("Lote criado com sucesso! Redirecionando...");
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
                                            <div className="flex items-center gap-3">
                                                {faturasPendentes.length > 1 && (
                                                    <Button
                                                        onClick={handlePayAll}
                                                        className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold shadow-lg shadow-green-100"
                                                        disabled={isCreatingLote}
                                                    >
                                                        {isCreatingLote ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                                                        Pagar Todas ({faturasPendentes.length})
                                                    </Button>
                                                )}
                                                {faturasPendentes.length === 0 && faturasAguardando.length > 0 && (
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                                                        {faturasAguardando.length} em análise
                                                    </span>
                                                )}
                                                <ViewModeToggle
                                                    viewMode={viewMode}
                                                    setViewMode={setViewMode}
                                                />
                                            </div>
                                        }
                                    />

                                    {faturas.length === 0 ? (
                                        <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-gray-200 shadow-sm">
                                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Wallet className="text-gray-300" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Nenhuma fatura encontrada</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                                Quando você participar de uma assinatura, as cobranças aparecerão aqui.
                                            </p>
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
                                    <SectionHeader title="Meus Pagamentos Consolidados" />
                                    <LotesTab lotes={lotes} />
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
        </PageContainer>
    );
}
