"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { StreamingDetailCard } from "@/components/streamings/StreamingDetailCard";
import { StreamingModal, StreamingFormData } from "@/components/modals/StreamingModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { createStreaming, updateStreaming, deleteStreaming } from "@/actions/streamings";

interface Streaming {
    id: number;
    streamingCatalogoId: number;
    valorIntegral: any;
    limiteParticipantes: number;
    catalogo: {
        nome: string;
        corPrimaria: string;
        iconeUrl: string | null;
    };
    _count?: {
        assinaturas: number;
    };
}

interface StreamingsClientProps {
    initialData: Streaming[];
}

export function StreamingsClient({ initialData }: StreamingsClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStreaming, setSelectedStreaming] = useState<Streaming | null>(null);
    const [loading, setLoading] = useState(false);

    // Filter logic
    const filteredStreamings = useMemo(() => {
        return initialData.filter((s) => {
            return s.catalogo.nome.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [initialData, searchTerm]);

    // Actions
    const handleAdd = async (data: StreamingFormData) => {
        setLoading(true);
        try {
            await createStreaming({
                catalogoId: parseInt(data.catalogoId),
                valorIntegral: parseFloat(data.valorIntegral),
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error creating streaming:", error);
            alert("Erro ao criar streaming.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (data: StreamingFormData & { updateExistingSubscriptions?: boolean }) => {
        if (!selectedStreaming) return;
        setLoading(true);
        try {
            const result = await updateStreaming(selectedStreaming.id, {
                catalogoId: parseInt(data.catalogoId),
                valorIntegral: parseFloat(data.valorIntegral),
                limiteParticipantes: parseInt(data.limiteParticipantes),
                updateExistingSubscriptions: data.updateExistingSubscriptions,
            });

            // Show success message with details
            if (result.updatedSubscriptions && result.updatedSubscriptions > 0) {
                alert(`Streaming atualizado com sucesso! ${result.updatedSubscriptions} assinatura(s) foram atualizadas com o novo valor.`);
            }

            setIsEditModalOpen(false);
        } catch (error: any) {
            console.error("Error updating streaming:", error);
            // Show user-friendly error message
            const errorMessage = error?.message || "Erro ao atualizar streaming.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedStreaming) return;
        setLoading(true);
        try {
            await deleteStreaming(selectedStreaming.id);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting streaming:", error);
            alert("Erro ao excluir streaming.");
        } finally {
            setLoading(false);
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
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation"
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 min-w-0"
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredStreamings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredStreamings.map((s) => (
                        <StreamingDetailCard
                            key={s.id}
                            id={s.id}
                            name={s.catalogo.nome}
                            color={s.catalogo.corPrimaria}
                            initial={s.catalogo.nome.charAt(0).toUpperCase()}
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
                    <p className="text-gray-400 text-base md:text-lg">Nenhum serviço de streaming cadastrado no seu catálogo.</p>
                </div>
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
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEdit}
                loading={loading}
                streaming={
                    selectedStreaming
                        ? {
                            catalogoId: String(selectedStreaming.streamingCatalogoId),
                            valorIntegral: String(selectedStreaming.valorIntegral),
                            limiteParticipantes: String(selectedStreaming.limiteParticipantes),
                            activeSubscriptions: selectedStreaming._count?.assinaturas || 0,
                        }
                        : undefined
                }
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Remover do Catálogo"
                message={`Tem certeza que deseja remover ${selectedStreaming?.catalogo.nome}? Todas as assinaturas vinculadas poderão ser afetadas.`}
            />
        </PageContainer>
    );
}
