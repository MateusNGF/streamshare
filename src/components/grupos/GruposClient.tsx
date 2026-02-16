"use client";

import { useState, useTransition } from "react";
import { Plus, Tv } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { GrupoFormModal } from "@/components/modals/GrupoFormModal";
import { GrupoRenovacaoModal } from "@/components/modals/GrupoRenovacaoModal";
import { deleteGrupo } from "@/actions/grupos";
import { useToast } from "@/hooks/useToast";
import { PageContainer } from "../layout/PageContainer";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { GruposGrid } from "./GruposGrid";
import { GruposTable } from "./GruposTable";

type Grupo = {
    id: number;
    nome: string;
    descricao: string | null;
    streamings: {
        streaming: {
            apelido: string | null;
            catalogo: {
                nome: string;
            };
        };
    }[];
    _count: {
        streamings: number;
    };
};

interface GruposClientProps {
    initialGrupos: Grupo[];
}

export function GruposClient({ initialGrupos }: GruposClientProps) {
    const toast = useToast();
    const [grupos, setGrupos] = useState(initialGrupos);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRenovacaoModalOpen, setIsRenovacaoModalOpen] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleOpenCreate = () => {
        setSelectedGrupo(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (grupo: Grupo) => {
        setSelectedGrupo(grupo);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (grupo: Grupo) => {
        setSelectedGrupo(grupo);
        setIsDeleteModalOpen(true);
    };

    const handleOpenRenovacao = (grupo: Grupo) => {
        setSelectedGrupo(grupo);
        setIsRenovacaoModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedGrupo) return;

        startTransition(async () => {
            try {
                await deleteGrupo(selectedGrupo.id);
                setGrupos((prev) => prev.filter((g) => g.id !== selectedGrupo.id));
                toast.success("Grupo excluído com sucesso!");
                setIsDeleteModalOpen(false);
                setSelectedGrupo(null);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erro ao excluir grupo");
            }
        });
    };

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        // Refresh from server
        window.location.reload();
    };

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <PageHeader
                    title="Grupos"
                    description="Agrupe seus streamings para facilitar a geração de mensagens de renovação"
                    className="mb-0" // Reset mb from PageHeader if needed
                />
                <div className="flex items-center gap-2">
                    <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-sm h-10"
                    >
                        <Plus size={18} />
                        Novo Grupo
                    </button>
                </div>
            </div>

            {grupos.length === 0 ? (
                <EmptyState
                    icon={Tv}
                    title="Nenhum grupo cadastrado"
                    description="Crie grupos para agrupar seus streamings e facilitar o envio de mensagens de renovação via WhatsApp."
                    action={
                        <button
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all"
                        >
                            <Plus size={20} />
                            Criar Primeiro Grupo
                        </button>
                    }
                />
            ) : (
                viewMode === "grid" ? (
                    <GruposGrid
                        grupos={grupos}
                        onRenovacao={handleOpenRenovacao}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                ) : (
                    <GruposTable
                        grupos={grupos}
                        onRenovacao={handleOpenRenovacao}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                )
            )}

            {/* Form Modal */}
            <GrupoFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={handleFormSuccess}
                grupo={selectedGrupo}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Grupo"
                message={`Tem certeza que deseja excluir o grupo "${selectedGrupo?.nome}"? Esta ação não pode ser desfeita.`}
                loading={isPending}
            />

            {/* Renovação Modal */}
            {selectedGrupo && (
                <GrupoRenovacaoModal
                    isOpen={isRenovacaoModalOpen}
                    onClose={() => setIsRenovacaoModalOpen(false)}
                    grupoId={selectedGrupo.id}
                    grupoNome={selectedGrupo.nome}
                />
            )}
        </PageContainer>
    );
}
