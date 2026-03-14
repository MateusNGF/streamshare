"use client";

import { useCobrancaFilters } from "@/hooks/useCobrancaFilters";
import { useCobrancasOperations } from "@/hooks/useCobrancasOperations";
import { useCobrancasSelection } from "@/hooks/useCobrancasSelection";
import { useCobrancasModals } from "@/hooks/useCobrancasModals";
import { useState } from "react";

/**
 * Facade Hook para ações de cobranças.
 * SOLID: Aplica o Single Responsibility Principle ao decompor lógica complexa em hooks menores.
 * Também atua como uma interface unificada para o componente CobrancasClient.
 */
export function useCobrancasActions(cobrancasIniciais: any[]) {
    // 1. Filtragem
    const {
        filters,
        filteredCobrancas,
        handleFilterChange,
        handleClearFilters
    } = useCobrancaFilters(cobrancasIniciais);

    // 2. Seleção
    const {
        selectedIds,
        batchTotal,
        hasMixedParticipants,
        toggleSelection,
        selectAll,
        clearSelection
    } = useCobrancasSelection(cobrancasIniciais);

    // 3. Modais & Estado de UI
    const modals = useCobrancasModals();
    const [activeLote, setActiveLote] = useState<any | null>(null);

    // 4. Operações de API
    const ops = useCobrancasOperations();

    // Handlers que combinam hooks
    const handleConfirmarPagamento = (id: number) => {
        modals.openConfirmPayment(id);
    };

    const executePaymentConfirmation = async (formData?: FormData) => {
        if (!modals.selectedCobrancaId) return;
        const id = modals.selectedCobrancaId;
        modals.setConfirmPaymentModalOpen(false);
        await ops.handleConfirmPayment(id, formData);
    };

    const handleCancelarCobranca = (id: number) => {
        modals.openCancel(id);
    };

    const confirmCancellation = async () => {
        if (!modals.selectedCobrancaId) return;
        const success = await ops.handleCancelCobranca(modals.selectedCobrancaId);
        if (success) modals.setCancelModalOpen(false);
    };

    const handleEnviarWhatsApp = (id: number) => {
        ops.handleSendNotification(id);
    };

    const handleViewQrCode = (id: number) => {
        modals.openQrCode(id);
    };

    const handleAbrirLote = async () => {
        return await ops.handleCreateBatchLote(Array.from(selectedIds));
    };

    const handleConfirmarLoteAdmin = async (loteId: number) => {
        const success = await ops.handleConfirmBatchLote(loteId);
        if (success) {
            modals.setBatchPixModalOpen(false);
            clearSelection();
        }
    };

    const handleEnviarWhatsAppLote = async () => {
        const success = await ops.handleSendBatchWhatsApp(Array.from(selectedIds));
        if (success) clearSelection();
    };

    return {
        // States & Data
        filters,
        filteredCobrancas,
        selectedCobranca: cobrancasIniciais.find(c => c.id === modals.selectedCobrancaId),
        loading: ops.loading,
        whatsappLoading: ops.whatsappLoading,

        // Selection
        selectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        batchTotal,
        hasMixedParticipants,

        // Modals state
        ...modals,
        activeLote,
        setActiveLote,

        // Actions
        handleConfirmarPagamento,
        executePaymentConfirmation,
        handleCancelarCobranca,
        confirmCancellation,
        handleEnviarWhatsApp,
        handleFilterChange,
        handleClearFilters,
        handleViewQrCode,
        handleAbrirLote,
        handleConfirmarLoteAdmin,
        handleEnviarWhatsAppLote
    };
}
