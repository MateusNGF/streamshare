"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { confirmarPagamento, enviarNotificacaoCobranca, cancelarCobranca } from "@/actions/cobrancas";

export function useCobrancasActions(cobrancasIniciais: any[]) {
    const toast = useToast();
    const router = useRouter();

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // UI State
    const [loading, setLoading] = useState(false);

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmPaymentModalOpen, setConfirmPaymentModalOpen] = useState(false);
    const [selectedCobrancaId, setSelectedCobrancaId] = useState<number | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const filteredCobrancas = cobrancasIniciais.filter(c => {
        const matchesSearch = c.assinatura.participante.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleConfirmarPagamento = (id: number) => {
        setSelectedCobrancaId(id);
        setConfirmPaymentModalOpen(true);
    };

    const executePaymentConfirmation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            await confirmarPagamento(selectedCobrancaId);
            toast.success("Pagamento confirmado com sucesso!");
            setConfirmPaymentModalOpen(false);
            router.refresh();
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            toast.error("Erro ao confirmar pagamento");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarCobranca = (id: number) => {
        setSelectedCobrancaId(id);
        setCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            await cancelarCobranca(selectedCobrancaId);
            toast.success("Cobrança cancelada com sucesso!");
            setCancelModalOpen(false);
            router.refresh();
            setTimeout(() => window.location.reload(), 500);
        } catch (error: any) {
            toast.error(error.message || "Erro ao cancelar cobrança");
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async (cobrancaId: number) => {
        try {
            const result = await enviarNotificacaoCobranca(cobrancaId);
            if (result.manualLink) {
                window.open(result.manualLink, '_blank');
                toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
            } else {
                toast.success("Notificação WhatsApp enviada automaticamente!");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar notificação");
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
    };

    return {
        // States
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        loading,

        // Modal States
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedCobrancaId, setSelectedCobrancaId,

        // Calculated
        filteredCobrancas,
        selectedCobranca: cobrancasIniciais.find(c => c.id === selectedCobrancaId),

        // Actions
        handleConfirmarPagamento,
        executePaymentConfirmation,
        handleCancelarCobranca,
        confirmCancellation,
        handleEnviarWhatsApp,
        handleClearFilters
    };
}
