"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { StreamingDetailCard } from "@/components/streamings/StreamingDetailCard";
import { StreamingModal, StreamingFormData } from "@/components/modals/StreamingModal";
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
    } = useStreamingStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStreaming, setSelectedStreaming] = useState<any | null>(null);

    // Initialize store with server data on mount
    useEffect(() => {
        fetchStreamings();
    }, [fetchStreamings]);

    // Show error toast if any
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error, toast]);

    // Get filtered streamings
    const filteredStreamings = getFiltered();

    // Actions with Zustand store
    const handleAdd = async (data: StreamingFormData) => {
        try {
            await createStreamingStore({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: parseFloat(data.valorIntegral),
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });
            toast.success("Streaming criado com sucesso!");
            setIsAddModalOpen(false);
        } catch (error: any) {
            toast.error(error?.message || "Erro ao criar streaming");
        }
    };

    const handleEdit = async (data: StreamingFormData & { updateExistingSubscriptions?: boolean }) => {
        if (!selectedStreaming) return;

        try {
            const result = await updateStreamingStore(selectedStreaming.id, {
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: parseFloat(data.valorIntegral),
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
            toast.error(error?.message || "Erro ao atualizar streaming");
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
            toast.error(error?.message || "Erro ao excluir streaming");
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
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por serviço..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ searchTerm: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 min-w-0"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && streamings.length === 0 ? (
                <div className="text-center py-12 md:py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-600 mt-4">Carregando streamings...</p>
                </div>
            ) : (
                <>
                    {/* Grid */}
                    {filteredStreamings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {filteredStreamings
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
                                        price={String(s.valorIntegral)}
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
                        <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-base md:text-lg">
                                {filters.searchTerm
                                    ? "Nenhum serviço encontrado com esse nome."
                                    : "Nenhum serviço de streaming cadastrado no seu catálogo."}
                            </p>
                        </div>
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
