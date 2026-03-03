"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { Button } from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";
import { getParticipantSubscriptionDetail } from "@/actions/dashboard";
import { useToast } from "@/hooks/useToast";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { MySubscriptionsTable } from "./MySubscriptionsTable";
import { MySubscriptionsGrid } from "./MySubscriptionsGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CredentialsModal } from "@/components/modals/CredentialsModal";
import { BatchActionBar } from "@/components/cobrancas/BatchActionBar";
import { ModalPagamentoLote } from "@/components/faturas/ModalPagamentoLote";
import { criarLotePagamento } from "@/actions/cobrancas";

interface MySubscriptionsSectionProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
}

export function MySubscriptionsSection({ subscriptions, currencyCode }: MySubscriptionsSectionProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const toast = useToast();

    // Credentials modal state
    const [credentialsSub, setCredentialsSub] = useState<ParticipantSubscription | null>(null);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

    // Batch Payment state
    const [selectedCobrancaIds, setSelectedCobrancaIds] = useState<Set<number>>(new Set());
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [activeLote, setActiveLote] = useState<any>(null);
    const [isCreatingLote, setIsCreatingLote] = useState(false);

    const batchTotal = useMemo(() => {
        return Array.from(selectedCobrancaIds).reduce((sum, id) => {
            const sub = subscriptions.find(s => s.pendingCobrancaId === id);
            return sum + (sub ? sub.valor : 0);
        }, 0);
    }, [selectedCobrancaIds, subscriptions]);

    const handleToggleSelect = (id: number) => {
        setSelectedCobrancaIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = (ids: number[]) => {
        setSelectedCobrancaIds(new Set(ids));
    };

    const handleClearSelection = () => {
        setSelectedCobrancaIds(new Set());
    };

    const handleAbrirLote = async () => {
        if (selectedCobrancaIds.size === 0) return;
        setIsCreatingLote(true);
        try {
            const result = await criarLotePagamento(Array.from(selectedCobrancaIds));
            if (result.success && result.data) {
                setActiveLote(result.data);
                setIsBatchModalOpen(true);
            } else {
                toast.error(result.error || "Erro ao preparar lote");
            }
        } catch (e) {
            toast.error("Erro inesperado ao criar lote");
        } finally {
            setIsCreatingLote(false);
        }
    };

    const handleViewDetails = async (subId: number) => {
        setLoadingDetails(true);
        try {
            const response = await getParticipantSubscriptionDetail(subId);
            if (response.success) {
                setSelectedAssinatura(response.data);
                setIsDetailsModalOpen(true);
            } else {
                toast.error(response.error || "Erro ao carregar detalhes");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao carregar detalhes");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleViewCredentials = (sub: ParticipantSubscription) => {
        setCredentialsSub(sub);
        setIsCredentialsModalOpen(true);
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                title="Minhas Assinaturas"
                className="mb-0"
                rightElement={
                    subscriptions.length > 0 && (
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    )
                }
            />

            {subscriptions.length === 0 ? (
                <div className="py-8">
                    <EmptyState
                        icon={ShieldCheck}
                        title="Nenhuma assinatura"
                        description="Você ainda não possui assinaturas ativas ou pendentes."
                        action={
                            <Link href="/explore">
                                <Button variant="outline" className="rounded-full px-8">
                                    Explorar Vagas
                                </Button>
                            </Link>
                        }
                    />
                </div>
            ) : (
                viewMode === "table" ? (
                    <MySubscriptionsTable
                        subscriptions={subscriptions}
                        currencyCode={currencyCode}
                        onViewDetails={handleViewDetails}
                        onViewCredentials={handleViewCredentials}
                        selectedIds={selectedCobrancaIds}
                        onToggleSelect={handleToggleSelect}
                        onSelectAll={handleSelectAll}
                    />
                ) : (
                    <MySubscriptionsGrid
                        subscriptions={subscriptions}
                        currencyCode={currencyCode}
                        onViewDetails={handleViewDetails}
                        onViewCredentials={handleViewCredentials}
                    />
                )
            )}

            <DetalhesAssinaturaModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                assinatura={selectedAssinatura}
            />

            <CredentialsModal
                isOpen={isCredentialsModalOpen}
                onClose={() => setIsCredentialsModalOpen(false)}
                subscriptionId={credentialsSub?.id ?? null}
                streamingName={credentialsSub?.streamingName ?? ""}
                streamingLogo={credentialsSub?.streamingLogo ?? null}
                streamingColor={credentialsSub?.streamingColor ?? ""}
            />

            <BatchActionBar
                count={selectedCobrancaIds.size}
                total={batchTotal}
                currencyCode={currencyCode as any}
                isAdmin={false}
                onPay={handleAbrirLote}
                onClear={handleClearSelection}
                loading={isCreatingLote}
            />

            {activeLote && (
                <ModalPagamentoLote
                    isOpen={isBatchModalOpen}
                    onClose={() => {
                        setIsBatchModalOpen(false);
                        handleClearSelection();
                    }}
                    lote={activeLote}
                    isAdmin={false}
                />
            )}
        </section>
    );
}
