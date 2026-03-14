"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useStreamingStore } from "@/stores";
import { useToast } from "@/hooks/useToast";
import { useStreamingActions } from "@/hooks/useStreamingActions";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { useActionError } from "@/hooks/useActionError";
import { useFilterParams } from "@/hooks/useFilterParams";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { PlanoConta } from "@prisma/client";
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

const StreamingFilters = dynamic(() => import("./StreamingFilters").then(mod => mod.StreamingFilters), {
    loading: () => <Skeleton className="w-full h-16 rounded-2xl" />
});

const StreamingGrid = dynamic(() => import("./StreamingGrid").then(mod => mod.StreamingGrid), {
    loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] rounded-2xl" />)}</div>
});

const StreamingTable = dynamic(() => import("./StreamingTable").then(mod => mod.StreamingTable), {
    loading: () => <TableSkeleton />
});

const StreamingModal = dynamic(() => import("@/components/modals/StreamingModal").then(mod => mod.StreamingModal));
const DeleteModal = dynamic(() => import("@/components/modals/DeleteModal").then(mod => mod.DeleteModal));
const AddMemberModal = dynamic(() => import("@/components/modals/AddMemberModal").then(mod => mod.AddMemberModal));

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
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const { filters } = useFilterParams();

    const {
        streamings,
        loading,
        error,
        fetchStreamings,
        clearError,
    } = useStreamingStore();

    const { modals, selectedStreaming, actions } = useStreamingActions();

    useEffect(() => {
        // Force refresh on mount to avoid stale persisted state bugs
        // Passing contaId from first item of initialData if available
        const currentContaId = initialData?.[0]?.contaId;
        fetchStreamings(true, currentContaId);
        setMounted(true);
    }, [fetchStreamings, initialData]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const displayStreamings = mounted ? streamings.filter((streaming) => {
        // Search term
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesApelido = streaming.apelido?.toLowerCase().includes(searchLower);
            const matchesCatalogo = streaming.catalogo?.nome?.toLowerCase().includes(searchLower);
            if (!matchesApelido && !matchesCatalogo) return false;
        }

        // Catalogo filter
        if (filters.catalogoId && filters.catalogoId !== "all") {
            if (String(streaming.streamingCatalogoId) !== String(filters.catalogoId)) return false;
        }

        // Only Full
        if (filters.onlyFull === "true") {
            const occupied = streaming._count?.assinaturas || 0;
            if (occupied < (streaming.limiteParticipantes || 0)) return false;
        }

        // Visibilidade
        if (filters.visibilidade && filters.visibilidade !== "all") {
            const isPublico = !!streaming.isPublico;
            if (filters.visibilidade === "publico" && !isPublico) return false;
            if (filters.visibilidade === "privado" && isPublico) return false;
        }

        // Valor
        if (filters.valor) {
            try {
                const range = JSON.parse(filters.valor);
                const val = Number(streaming.valorIntegral || 0);
                if (range.min && val < range.min) return false;
                if (range.max && val > range.max) return false;
            } catch (e) { }
        }

        return true;
    }) : (initialData || []);

    const isLoading = mounted ? loading : false;

    return (
        <PageContainer>
            <PageHeader
                title="Meu Catálogo"
                description="Os serviços que você disponibiliza e suas vagas"
                action={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddMemberOpen(true)}
                            className="hidden sm:flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold border border-gray-100 shadow-sm transition-all hover:-translate-y-0.5"
                        >
                            <UserPlus size={20} className="text-primary" />
                            Convidar
                        </button>
                        <button
                            onClick={() => modals.add.setOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={20} />
                            Novo Serviço
                        </button>
                    </div>
                }
            />



            {/* Filters & View Toggle */}
            <div className="py-2">
                <StreamingFilters streamings={streamings} />
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
                    searchTerm={filters.searchTerm || ""}
                    onEdit={actions.openEdit}
                    onDelete={actions.openDelete}
                />
            ) : (
                <StreamingTable
                    streamings={displayStreamings}
                    isLoading={isLoading}
                    searchTerm={filters.searchTerm || ""}
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

            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                streamings={streamings.map(s => ({
                    id: s.id,
                    apelido: s.apelido,
                    catalogo: { nome: s.catalogo.nome },
                    vagasRestantes: Math.max(0, (s.limiteParticipantes || 0) - (s._count?.assinaturas || 0))
                }))}
            />
        </PageContainer>
    );
}
