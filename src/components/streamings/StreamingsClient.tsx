"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { StreamingDetailCard } from "@/components/streamings/StreamingDetailCard";
import { StreamingModal, StreamingFormData } from "@/components/modals/StreamingModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/useToast";
import { useStreamingStore } from "@/stores";

interface StreamingsClientProps {
    initialData?: any[]; // Optional for progressive enhancement
}

export function StreamingsClient({ initialData }: StreamingsClientProps) {
    const toast = useToast();

    // Zustand store
    const {
        streamings,
        loading,
        error,
        filters,
        fetchStreamings,
        createStreaming: createStreamingStore,
        updateStreaming: updateStreamingStore,
        deleteStreaming: deleteStreamingStore,
        setFilters,
        getFiltered,
        clearError,
    } = useStreamingStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStreaming, setSelectedStreaming] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);

    // Initialize store with server data on mount
    useEffect(() => {
        fetchStreamings();
        setMounted(true);
    }, [fetchStreamings]);

    // Show error toast if any
    // Show error toast if any
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    // Anti-hydration mismatch: Use initialData on server/first render, then store data
    // This allows SEO to work (server renders initialData) and prevents hydration errors
    // when persisted store has different data than server.
    const displayStreamings = mounted ? getFiltered() : (initialData || []);
    const isLoading = mounted ? loading : false; // Server is never loading, it has data

    // Actions with Zustand store
    const handleAdd = async (data: StreamingFormData) => {
        try {
            await createStreamingStore({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });
            toast.success("Streaming criado com sucesso!");
            setIsAddModalOpen(false);
        } catch (error: any) {
            // Error is handled by store listener
            console.error(error);
        }
    };

    const handleEdit = async (data: StreamingFormData & { updateExistingSubscriptions?: boolean }) => {
        if (!selectedStreaming) return;

        try {
            const result = await updateStreamingStore(selectedStreaming.id, {
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
                updateExistingSubscriptions: data.updateExistingSubscriptions,
            });

            // Show success message with details
            if (result.updatedSubscriptions && result.updatedSubscriptions > 0) {
                toast.success(`Streaming atualizado! ${result.updatedSubscriptions} assinatura(s) atualizadas com o novo valor.`);
            } else {
                toast.success("Streaming atualizado com sucesso!");
            }

            setIsEditModalOpen(false);
            setSelectedStreaming(null);
        } catch (error: any) {
            // Error is handled by store listener
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!selectedStreaming) return;

        try {
            await deleteStreamingStore(selectedStreaming.id);
            toast.success("Streaming removido do catálogo");
            setIsDeleteModalOpen(false);
            setSelectedStreaming(null);
        } catch (error: any) {
            // Error is handled by store listener
            console.error(error);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Meu Catálogo"
                description="Os serviços que você disponibiliza e suas vagas"
                action={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        aria-label="Adicionar novo serviço de streaming"
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        Novo Serviço
                    </button>
                }
            />

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <GenericFilter
                    filters={[
                        {
                            key: "searchTerm",
                            type: "text",
                            placeholder: "Buscar por serviço...",
                            className: "w-full md:w-auto flex-1"
                        },
                        {
                            key: "catalogoId",
                            type: "select",
                            label: "Tipo de Serviço",
                            className: "w-full md:w-[200px]",
                            options: Array.from(new Set(streamings.map(s => JSON.stringify({ id: s.catalogo.id, nome: s.catalogo.nome }))))
                                .map((json: any) => JSON.parse(json))
                                .map((cat: any) => ({
                                    label: cat.nome,
                                    value: String(cat.id)
                                }))
                        },
                        {
                            key: "onlyFull",
                            type: "switch",
                            label: "Apenas grupos lotados",
                            className: "w-auto"
                        }
                    ]}
                    values={{
                        searchTerm: filters.searchTerm,
                        catalogoId: filters.catalogoId ? String(filters.catalogoId) : "all",
                        onlyFull: String(filters.onlyFull || false)
                    }}
                    onChange={(key: string, value: string) => {
                        if (key === 'catalogoId') {
                            setFilters({ ...filters, catalogoId: value === 'all' ? undefined : Number(value) });
                        } else if (key === 'onlyFull') {
                            setFilters({ ...filters, onlyFull: value === 'true' });
                        } else {
                            setFilters({ ...filters, [key]: value });
                        }
                    }}
                    onClear={() => setFilters({ searchTerm: "", catalogoId: undefined, onlyFull: false })}
                />
            </div>


            {/* Loading State */}
            {isLoading && displayStreamings.length === 0 ? (
                <div className="text-center py-12 md:py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-600 mt-4">Carregando streamings...</p>
                </div>
            ) : (
                <>
                    {/* Grid */}
                    {displayStreamings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {displayStreamings
                                .filter((s) => s.catalogo) // Only render if catalogo is defined
                                .map((s) => (
                                    <StreamingDetailCard
                                        key={s.id}
                                        id={s.id}
                                        name={s.apelido || s.catalogo.nome}
                                        catalogName={s.catalogo.nome}
                                        color={s.catalogo.corPrimaria}
                                        initial={(s.apelido || s.catalogo.nome).charAt(0).toUpperCase()}
                                        iconeUrl={s.catalogo.iconeUrl}
                                        slots={{ occupied: s._count?.assinaturas || 0, total: s.limiteParticipantes }}
                                        price={s.valorIntegral}
                                        frequency="Mensal"
                                        onEdit={() => {
                                            setSelectedStreaming(s);
                                            setIsEditModalOpen(true);
                                        }}
                                        onDelete={() => {
                                            setSelectedStreaming(s);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    />
                                ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Search}
                            title="Nenhum serviço encontrado"
                            description={filters.searchTerm
                                ? "Não encontramos nenhum serviço com o termo pesquisado."
                                : "Você ainda não cadastrou nenhum serviço de streaming."}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <StreamingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                loading={loading}
            />
            <StreamingModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedStreaming(null);
                }}
                onSave={handleEdit}
                loading={loading}
                streaming={
                    selectedStreaming
                        ? {
                            catalogoId: String(selectedStreaming.streamingCatalogoId),
                            apelido: selectedStreaming.apelido || "",
                            valorIntegral: String(selectedStreaming.valorIntegral),
                            limiteParticipantes: String(selectedStreaming.limiteParticipantes),
                            activeSubscriptions: selectedStreaming._count?.assinaturas || 0,
                        }
                        : undefined
                }
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedStreaming(null);
                }}
                onConfirm={handleDelete}
                loading={loading}
                title="Remover do Catálogo"
                message={`Tem certeza que deseja remover ${selectedStreaming?.catalogo?.nome || 'este serviço'}? Todas as assinaturas vinculadas poderão ser afetadas.`}
            />
        </PageContainer>
    );
}
