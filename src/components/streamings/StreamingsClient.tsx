"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StreamingModal } from "@/components/modals/StreamingModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { useStreamingStore } from "@/stores";
import { useToast } from "@/hooks/useToast";
import { useStreamingActions } from "@/hooks/useStreamingActions";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { useActionError } from "@/hooks/useActionError";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { PlanoConta } from "@prisma/client";

// Refactored Sub-components
import { StreamingFilters } from "./StreamingFilters";
import { StreamingGrid } from "./StreamingGrid";
import { StreamingTable } from "./StreamingTable";
import { SectionHeader } from "../layout/SectionHeader";

interface StreamingsClientProps {
    initialData?: any[];
    plano: PlanoConta;
    serverError?: string;
}

export function StreamingsClient({ initialData, plano, serverError }: StreamingsClientProps) {
    const toast = useToast();
    useActionError(serverError);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const {
        streamings,
        loading,
        error,
        filters,
        fetchStreamings,
        setFilters,
        getFiltered,
        clearError,
    } = useStreamingStore();

    const { modals, selectedStreaming, actions } = useStreamingActions();

    useEffect(() => {
        fetchStreamings();
        setMounted(true);
    }, [fetchStreamings]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const displayStreamings = mounted ? getFiltered() : (initialData || []);
    const isLoading = mounted ? loading : false;

    return (
        <PageContainer>
            <PageHeader
                title="Meu Catálogo"
                description="Os serviços que você disponibiliza e suas vagas"
                action={
                    <button
                        onClick={() => modals.add.setOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Novo Serviço
                    </button>
                }
            />



            {/* Filters & View Toggle */}
            <div className="py-2">
                <StreamingFilters
                    streamings={streamings}
                    filters={filters}
                    onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
                    onClear={() => setFilters({ searchTerm: "", catalogoId: undefined, onlyFull: false })}
                />
            </div>

            {plano !== PlanoConta.business && (
                <div className="py-4">
                    <UpgradeBanner
                        variant="gold"
                        size="normal"
                        title="Catálogo Business Ilimitado"
                        description="Crie quantos serviços desejar e habilite o faturamento automático por streaming."
                        className=""
                    />
                </div>
            )}

            <SectionHeader
                title="Lista de catálogos"
                rightElement={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
            />

            {/* List/Grid */}
            {viewMode === "grid" ? (
                <StreamingGrid
                    streamings={displayStreamings}
                    isLoading={isLoading}
                    searchTerm={filters.searchTerm}
                    onEdit={actions.openEdit}
                    onDelete={actions.openDelete}
                />
            ) : (
                <StreamingTable
                    streamings={displayStreamings}
                    isLoading={isLoading}
                    searchTerm={filters.searchTerm}
                    onEdit={actions.openEdit}
                    onDelete={actions.openDelete}
                />
            )}

            {/* Modals */}
            <StreamingModal
                isOpen={modals.add.isOpen}
                onClose={() => modals.add.setOpen(false)}
                onSave={actions.handleAdd}
                loading={loading}
            />
            {selectedStreaming && (
                <>
                    <StreamingModal
                        isOpen={modals.edit.isOpen}
                        onClose={() => modals.edit.setOpen(false)}
                        onSave={actions.handleEdit}
                        loading={loading}
                        streaming={{
                            catalogoId: String(selectedStreaming.streamingCatalogoId),
                            apelido: selectedStreaming.apelido || "",
                            valorIntegral: String(selectedStreaming.valorIntegral),
                            limiteParticipantes: String(selectedStreaming.limiteParticipantes),
                            isPublico: selectedStreaming.isPublico,
                            activeSubscriptions: selectedStreaming._count?.assinaturas || 0,
                        }}
                    />
                    <DeleteModal
                        isOpen={modals.del.isOpen}
                        onClose={() => modals.del.setOpen(false)}
                        onConfirm={actions.handleDelete}
                        loading={loading}
                        title="Remover do Catálogo"
                        message={`Tem certeza que deseja remover ${selectedStreaming?.catalogo?.nome || 'este serviço'}?`}
                    />
                </>
            )}
        </PageContainer>
    );
}
