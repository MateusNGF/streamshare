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
    const [vencimentoRange, setVencimentoRange] = useState("");
    const [pagamentoRange, setPagamentoRange] = useState("");
    const [valorRange, setValorRange] = useState("");
    const [hasWhatsappFilter, setHasWhatsappFilter] = useState("false");

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

        let matchesVencimento = true;
        if (vencimentoRange) {
            try {
                const range = JSON.parse(vencimentoRange);
                const date = new Date(c.dataVencimento);
                if (range.from && date < new Date(range.from)) matchesVencimento = false;
                if (range.to && date > new Date(range.to)) matchesVencimento = false;
            } catch (e) { }
        }

        let matchesPagamento = true;
        if (pagamentoRange && c.dataPagamento) {
            try {
                const range = JSON.parse(pagamentoRange);
                const date = new Date(c.dataPagamento);
                if (range.from && date < new Date(range.from)) matchesPagamento = false;
                if (range.to && date > new Date(range.to)) matchesPagamento = false;
            } catch (e) { }
        } else if (pagamentoRange && !c.dataPagamento) {
            matchesPagamento = false;
        }

        let matchesValor = true;
        if (valorRange) {
            try {
                const range = JSON.parse(valorRange);
                const valor = Number(c.valor);
                if (range.min && valor < Number(range.min)) matchesValor = false;
                if (range.max && valor > Number(range.max)) matchesValor = false;
            } catch (e) { }
        }

        let matchesWhatsapp = true;
        if (hasWhatsappFilter === "true") {
            matchesWhatsapp = !!c.assinatura.participante.whatsappNumero;
        }

        return matchesSearch && matchesStatus && matchesVencimento && matchesPagamento && matchesValor && matchesWhatsapp;
    });

    const handleConfirmarPagamento = (id: number) => {
        setSelectedCobrancaId(id);
        setConfirmPaymentModalOpen(true);
    };

    const executePaymentConfirmation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            const result = await confirmarPagamento(selectedCobrancaId);
            if (result.success) {
                toast.success("Pagamento confirmado com sucesso!");
                setConfirmPaymentModalOpen(false);
                router.refresh();
                setTimeout(() => window.location.reload(), 500);
            } else if (result.error) {
                toast.error(result.error);
            }
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
        setSearchTerm("");
        setStatusFilter("all");
        setVencimentoRange("");
        setPagamentoRange("");
        setValorRange("");
        setHasWhatsappFilter("false");
    };

    return {
        // States
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        vencimentoRange, setVencimentoRange,
        pagamentoRange, setPagamentoRange,
        valorRange, setValorRange,
        hasWhatsappFilter, setHasWhatsappFilter,
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
