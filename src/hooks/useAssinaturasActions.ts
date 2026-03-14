"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { createBulkAssinaturas, cancelarAssinatura } from "@/actions/assinaturas";
import { useBaseFilter } from "@/hooks/useBaseFilter";

export function useAssinaturasActions(streamings: any[]) {
    const router = useRouter();
    const toast = useToast();
    const {
        filters,
        handleFilterChange,
        handleClearFilters
    } = useBaseFilter('/assinaturas');

    // States
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const filterValues = useMemo(() => ({
        searchTerm: filters.search || "",
        statusFilter: filters.status || "all",
        streamingFilter: filters.streaming || "all",
        participanteFilter: filters.participante || "all",
        criacaoRange: filters.criacao || "",
        vencimentoRange: filters.vencimento || "",
        valorRange: filters.valor || "",
        hasWhatsappFilter: filters.hasWhatsapp || "false"
    }), [filters]);

    const handleCancelSubmit = async (reason: string) => {
        if (!selectedAssinatura) return;
        setCancelling(true);
        try {
            const result = await cancelarAssinatura(selectedAssinatura.id, reason);
            if (result.success) {
                toast.success('Assinatura cancelada com sucesso');
                setCancelModalOpen(false);
                setSelectedAssinatura(null);
                router.refresh();
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Falha ao cancelar assinatura');
        } finally {
            setCancelling(false);
        }
    };

    const streamingsWithOcupados = useMemo(() => {
        return streamings.map(s => ({
            id: s.id,
            nome: s.apelido || s.catalogo.nome,
            apelido: s.apelido,
            catalogoNome: s.catalogo.nome,
            valorIntegral: Number(s.valorIntegral),
            limiteParticipantes: s.limiteParticipantes,
            ocupados: s._count?.assinaturas || 0,
            cor: s.catalogo.corPrimaria,
            iconeUrl: s.catalogo.iconeUrl,
            frequenciasHabilitadas: s.frequenciasHabilitadas
        }));
    }, [streamings]);

    return {
        // States & Modals
        cancelModalOpen, setCancelModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedAssinatura, setSelectedAssinatura,
        cancelling,

        // Filters
        filters: filterValues,
        handleFilterChange,
        handleClearFilters,

        // Actions
        handleCancelSubmit,
        streamingsWithOcupados
    };
}
