"use client";

import { useBaseFilter } from "@/hooks/useBaseFilter";
import { sortByStatusPriority } from "@/lib/financeiro-utils";
import { useMemo } from "react";

/**
 * Hook especializado para o gerenciamento de filtros de cobranças.
 * SOLID: SRP (Single Responsibility Principle) - Separa a lógica de filtragem da lógica de ações.
 */
export function useCobrancaFilters(cobrancasIniciais: any[]) {
    const {
        filters,
        handleFilterChange,
        handleClearFilters,
        updateFilters
    } = useBaseFilter('/cobrancas');

    const filterValues = useMemo(() => ({
        searchTerm: filters.search || "",
        statusFilter: filters.status || "all",
        streamingFilter: filters.streaming || "all",
        participanteFilter: filters.participante || "all",
        mesReferencia: filters.mesReferencia || "all",
        vencimentoRange: filters.vencimento || "",
        pagamentoRange: filters.pagamento || "",
        valorRange: filters.valor || "",
        hasWhatsappFilter: filters.hasWhatsapp || "false"
    }), [filters]);

    const filteredCobrancas = cobrancasIniciais.filter(c => {
        const matchesSearch = c.assinatura.participante.nome.toLowerCase().includes(filterValues.searchTerm.toLowerCase());
        const matchesStatus = filterValues.statusFilter === "all" || c.status === filterValues.statusFilter;
        const matchesStreaming = filterValues.streamingFilter === "all" || (c.assinatura?.streamingId?.toString() ?? "") === filterValues.streamingFilter;
        const matchesParticipante = filterValues.participanteFilter === "all" || (c.assinatura?.participanteId?.toString() ?? "") === filterValues.participanteFilter;

        let matchesMes = true;
        if (filterValues.mesReferencia !== "all") {
            const date = new Date(c.dataVencimento);
            const cobrancaMes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            matchesMes = cobrancaMes === filterValues.mesReferencia;
        }

        let matchesVencimento = true;
        if (filterValues.vencimentoRange) {
            try {
                const range = JSON.parse(filterValues.vencimentoRange);
                const date = new Date(c.dataVencimento);
                if (range.from && date < new Date(range.from)) matchesVencimento = false;
                if (range.to && date > new Date(range.to)) matchesVencimento = false;
            } catch (e) { }
        }

        let matchesPagamento = true;
        if (filterValues.pagamentoRange && c.dataPagamento) {
            try {
                const range = JSON.parse(filterValues.pagamentoRange);
                const date = new Date(c.dataPagamento);
                if (range.from && date < new Date(range.from)) matchesPagamento = false;
                if (range.to && date > new Date(range.to)) matchesPagamento = false;
            } catch (e) { }
        } else if (filterValues.pagamentoRange && !c.dataPagamento) {
            matchesPagamento = false;
        }

        let matchesValor = true;
        if (filterValues.valorRange) {
            try {
                const range = JSON.parse(filterValues.valorRange);
                const valor = Number(c.valor);
                if (range.min && valor < Number(range.min)) matchesValor = false;
                if (range.max && valor > Number(range.max)) matchesValor = false;
            } catch (e) { }
        }

        let matchesWhatsapp = true;
        if (filterValues.hasWhatsappFilter === "true") {
            matchesWhatsapp = !!c.assinatura.participante.whatsappNumero;
        }

        return matchesSearch && matchesStatus && matchesStreaming && matchesParticipante && matchesMes && matchesVencimento && matchesPagamento && matchesValor && matchesWhatsapp;
    });

    const sortedCobrancas = sortByStatusPriority(filteredCobrancas);

    return {
        filters: filterValues,
        filteredCobrancas: sortedCobrancas,
        handleFilterChange,
        handleClearFilters,
        updateFilters
    };
}
