"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { createBulkAssinaturas, cancelarAssinatura } from "@/actions/assinaturas";

export function useAssinaturasActions(streamings: any[]) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();

    // States
    const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Filters
    const searchTerm = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const streamingFilter = searchParams.get("streaming") || "all";
    const criacaoRange = searchParams.get("criacao") || "";
    const valorRange = searchParams.get("valor") || "";
    const hasWhatsappFilter = searchParams.get("hasWhatsapp") || "false";

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "" || value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/assinaturas?${params.toString()}`);
    };

    const handleClearFilters = () => {
        router.push('/assinaturas');
    };

    const handleCreateMultiple = async (data: any) => {
        setLoading(true);
        try {
            const result = await createBulkAssinaturas(data);
            if (result.success && result.data) {
                const message = `${result.data.created} assinatura${result.data.created > 1 ? 's' : ''} criada${result.data.created > 1 ? 's' : ''} com sucesso!`;
                toast.success(message);
                setIsMultipleModalOpen(false);
                router.refresh();
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Falha ao criar assinaturas');
        } finally {
            setLoading(false);
        }
    };

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
        isMultipleModalOpen, setIsMultipleModalOpen,
        cancelModalOpen, setCancelModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedAssinatura, setSelectedAssinatura,
        loading, cancelling,

        // Filters
        filters: { searchTerm, statusFilter, streamingFilter, criacaoRange, valorRange, hasWhatsappFilter },
        handleFilterChange,
        handleClearFilters,

        // Actions
        handleCreateMultiple,
        handleCancelSubmit,
        streamingsWithOcupados
    };
}
