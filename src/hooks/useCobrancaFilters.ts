"use client";

import { useBaseFilter } from "@/hooks/useBaseFilter";
import { sortByStatusPriority } from "@/lib/financeiro-utils";
import { useMemo } from "react";
import { isWithinDateRange, isWithinNumberRange, matchesMonthReference } from "@/lib/filter-utils";

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

    const filteredCobrancas = useMemo(() => {
        const result = cobrancasIniciais.filter(c => {
            // Texto/Busca
            const matchesSearch = c.assinatura.participante.nome.toLowerCase().includes(filterValues.searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            // Seletores Simples
            if (filterValues.statusFilter !== "all" && c.status !== filterValues.statusFilter) return false;
            if (filterValues.streamingFilter !== "all" && (c.assinatura?.streamingId?.toString() ?? "") !== filterValues.streamingFilter) return false;
            if (filterValues.participanteFilter !== "all" && (c.assinatura?.participanteId?.toString() ?? "") !== filterValues.participanteFilter) return false;

            // Mês de Referência
            if (!matchesMonthReference(c.dataVencimento, filterValues.mesReferencia)) return false;

            // Intervalos (Delegados para utilitários)
            if (!isWithinDateRange(c.dataVencimento, filterValues.vencimentoRange)) return false;
            if (!isWithinDateRange(c.dataPagamento, filterValues.pagamentoRange)) return false;
            if (!isWithinNumberRange(c.valor, filterValues.valorRange)) return false;

            // Flag WhatsApp
            if (filterValues.hasWhatsappFilter === "true" && !c.assinatura.participante.whatsappNumero) return false;

            return true;
        });

        return sortByStatusPriority(result);
    }, [cobrancasIniciais, filterValues]);

    return {
        filters: filterValues,
        filteredCobrancas,
        handleFilterChange,
        handleClearFilters,
        updateFilters
    };
}
