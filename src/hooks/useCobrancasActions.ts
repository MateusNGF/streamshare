"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCobrancaFilters } from "@/hooks/useCobrancaFilters";
import { useToast } from "@/hooks/useToast";
import {
    confirmarPagamento,
    enviarNotificacaoCobranca,
    cancelarCobranca,
    criarLotePagamento,
    confirmarLotePagamento,
    enviarWhatsAppEmLote
} from "@/actions/cobrancas";

export function useCobrancasActions(cobrancasIniciais: any[]) {
    const toast = useToast();
    const router = useRouter();

    // Filters & Sorting (SOLID: SRP via hook)
    const {
        filters,
        filteredCobrancas,
        handleFilterChange,
        updateFilters
    } = useCobrancaFilters(cobrancasIniciais);

    // UI State
    const [loading, setLoading] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmPaymentModalOpen, setConfirmPaymentModalOpen] = useState(false);
    const [selectedCobrancaId, setSelectedCobrancaId] = useState<number | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Batch Selection State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [activeLote, setActiveLote] = useState<any | null>(null);
    const [batchPixModalOpen, setBatchPixModalOpen] = useState(false);


    // Batch Calculations
    const batchTotal = Array.from(selectedIds).reduce((sum, id) => {
        const cobranca = cobrancasIniciais.find(c => c.id === id);
        return sum + (cobranca ? Number(cobranca.valor) : 0);
    }, 0);

    const hasMixedParticipants = (() => {
        if (selectedIds.size <= 1) return false;
        const idsArray = Array.from(selectedIds);
        const firstCobranca = cobrancasIniciais.find(c => c.id === idsArray[0]);
        if (!firstCobranca) return false;

        const firstParticipantId = firstCobranca.assinatura.participanteId;
        return idsArray.some(id => {
            const c = cobrancasIniciais.find(curr => curr.id === id);
            return c && c.assinatura.participanteId !== firstParticipantId;
        });
    })();

    // Selection Handlers
    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = (ids: number[]) => {
        setSelectedIds(new Set(ids));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // Batch Actions
    const handleAbrirLote = async () => {
        if (selectedIds.size === 0) return false;
        setLoading(true);
        try {
            const result = await criarLotePagamento(Array.from(selectedIds), true);
            if (result.success && result.data) {
                router.push(`/cobrancas/lotes?loteId=${result.data.id}`);
                return true;
            } else if (result.error) {
                toast.error(result.error);
                return false;
            }
            return false;
        } catch (error) {
            toast.error("Erro ao preparar lote de pagamento");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarLoteAdmin = async (loteId: number) => {
        setLoading(true);
        try {
            const result = await confirmarLotePagamento(loteId);
            if (result.success) {
                toast.success("Lote confirmado com sucesso!");
                setBatchPixModalOpen(false);
                clearSelection();
                router.refresh();
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(result.error || "Erro ao confirmar lote");
            }
        } catch (error) {
            toast.error("Erro ao confirmar lote");
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsAppLote = async () => {
        if (selectedIds.size === 0) return;
        setWhatsappLoading(true);
        try {
            const result = await enviarWhatsAppEmLote(Array.from(selectedIds));
            if (result.success && result.data) {
                const manualLinks = result.data.filter((r: any) => r.manualLink);
                const sentCount = result.data.filter((r: any) => r.success).length;

                if (manualLinks.length > 0) {
                    manualLinks.forEach((l: any) => window.open(l.manualLink, '_blank'));
                    toast.info(`${manualLinks.length} links do WhatsApp abertos!`);
                } else if (sentCount > 0) {
                    toast.success(`${sentCount} notificações enviadas com sucesso!`);
                }

                clearSelection();
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao enviar mensagens em lote");
        } finally {
            setWhatsappLoading(false);
        }
    };

    const handleConfirmarPagamento = (id: number) => {
        setSelectedCobrancaId(id);
        setConfirmPaymentModalOpen(true);
    };

    // Undo flow state
    const [pendingActions, setPendingActions] = useState<Map<number, NodeJS.Timeout>>(new Map());

    const executePaymentConfirmation = async (formData?: FormData) => {
        if (!selectedCobrancaId) return;

        const id = selectedCobrancaId;
        setConfirmPaymentModalOpen(false);

        // Se já houver uma ação pendente para este ID, cancela a anterior
        if (pendingActions.has(id)) {
            clearTimeout(pendingActions.get(id));
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const result = await confirmarPagamento(id, formData);
                if (result.success) {
                    toast.success("Pagamento confirmado com sucesso!");
                    router.refresh();
                    setTimeout(() => window.location.reload(), 500);
                } else if (result.error) {
                    toast.error(result.error);
                }
            } catch (error) {
                toast.error("Erro ao confirmar pagamento");
            } finally {
                setLoading(false);
                setPendingActions(prev => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
            }
        }, 5000);

        setPendingActions(prev => new Map(prev).set(id, timer));

        toast.success("Confirmando pagamento...", 5000, {
            label: "Desfazer",
            onClick: () => {
                clearTimeout(timer);
                setPendingActions(prev => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
                toast.info("Ação desfeita com sucesso.");
            }
        });
    };

    const handleCancelarCobranca = (id: number) => {
        setSelectedCobrancaId(id);
        setCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            const result = await cancelarCobranca(selectedCobrancaId);
            if (result.success) {
                toast.success("Cobrança cancelada com sucesso!");
                setCancelModalOpen(false);
                router.refresh();
                setTimeout(() => window.location.reload(), 500);
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao cancelar cobrança");
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async (cobrancaId: number) => {
        try {
            const result = await enviarNotificacaoCobranca(cobrancaId);
            if (result.success && result.data) {
                if (result.data.manualLink) {
                    window.open(result.data.manualLink, '_blank');
                    toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
                } else {
                    toast.success("Notificação WhatsApp enviada automaticamente!");
                }
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar notificação");
        }
    };

    const handleClearFilters = () => {
        router.push('/cobrancas');
    };

    const handleViewQrCode = (id: number) => {
        setSelectedCobrancaId(id);
        setQrModalOpen(true);
    };

    return {
        // States
        filters,
        loading,
        whatsappLoading,

        // Modal States
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        qrModalOpen, setQrModalOpen,
        selectedCobrancaId, setSelectedCobrancaId,

        // Calculated
        filteredCobrancas,
        selectedCobranca: cobrancasIniciais.find(c => c.id === selectedCobrancaId),

        // Batch States
        selectedIds, toggleSelection, selectAll, clearSelection,
        batchTotal, hasMixedParticipants, activeLote, setActiveLote,
        batchPixModalOpen, setBatchPixModalOpen,

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
