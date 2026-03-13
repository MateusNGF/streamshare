"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { criarLotePagamento } from "@/actions/cobrancas";
import { ViewMode } from "@/components/ui/ViewModeToggle";
import { useBaseFilter } from "@/hooks/useBaseFilter";

export function useFaturasActions(faturasIniciais: any[], lotes: any[]) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();

    const {
        filters,
        handleFilterChange,
        handleClearFilters
    } = useBaseFilter('/faturas');

    const filterValues = useMemo(() => ({
        statusFilter: filters.status || "all",
        participanteFilter: filters.participante || "all"
    }), [filters]);

    // Derived State
    const faturasPendentesForTab = useMemo(() => faturasIniciais.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado')), [faturasIniciais]);
    const lotesPendentes = useMemo(() => lotes.filter(l => l.status === 'pendente' || l.status === 'atrasado' || l.status === 'aguardando_aprovacao'), [lotes]);

    const faturasPendentes = useMemo(() => faturasIniciais.filter(f => !f.lotePagamentoId && (f.status === "pendente" || f.status === "atrasado")), [faturasIniciais]);
    const faturasAguardando = useMemo(() => faturasIniciais.filter(f => f.status === 'aguardando_aprovacao'), [faturasIniciais]);

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [activeTabId, setActiveTabId] = useState(() => (filters.tab === "lotes" || (faturasPendentesForTab.length === 0 && lotesPendentes.length > 0)) ? "lotes" : "faturas");

    // Selection State
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [selectedFaturaIds, setSelectedFaturaIds] = useState<number[]>([]);

    // Modal & Loading State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCreatingLote, setIsCreatingLote] = useState(false);

    // Initial Load derived from URL
    useEffect(() => {
        const tab = filters.tab;
        const loteId = filters.loteId;

        if (tab === "lotes") {
            setActiveTabId("lotes");
        }

        if (loteId && lotes.length > 0) {
            const lote = lotes.find(l => l.id === Number(loteId));
            if (lote) {
                setActiveTabId("lotes");
            }
        }
    }, [searchParams, lotes]);

    // Actions
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
        const fatura = faturasIniciais.find(f => f.id === id);
        if (fatura) {
            setSelectedFatura(fatura);
            setIsDetailsModalOpen(true);
        }
    };

    const clearSelection = () => {
        setSelectedFaturaIds([]);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedFatura(null);
    };

    return {
        // Derived Data
        faturasPendentes,
        faturasAguardando,

        // UI State
        viewMode,
        setViewMode,
        activeTabId,
        setActiveTabId,

        // Selection State
        selectedFatura,
        selectedFaturaIds,
        setSelectedFaturaIds,
        clearSelection,

        // Modal & Loading State
        isDetailsModalOpen,
        closeDetailsModal,
        isCreatingLote,

        // Actions
        handleCreateLote,
        handleViewDetails,
        filters: filterValues,
        handleFilterChange,
        handleClearFilters,
    };
}
