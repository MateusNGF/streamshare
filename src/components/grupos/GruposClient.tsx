"use client";

import { useState, useTransition } from "react";
import { Plus, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
import { SectionHeader } from "@/components/layout/SectionHeader";

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
                const result = await deleteGrupo(selectedGrupo.id);
                if (result.success) {
                    setGrupos((prev) => prev.filter((g) => g.id !== selectedGrupo.id));
                    toast.success("Grupo excluído com sucesso!");
                    setIsDeleteModalOpen(false);
                    setSelectedGrupo(null);
                } else if (result.error) {
                    toast.error(result.error);
                }
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
            <PageHeader
                title="Grupos"
                description="Agrupe seus streamings para facilitar a geração de mensagens de renovação"
                action={
                    <Button
                        onClick={handleOpenCreate}
                        className="gap-2 shadow-lg shadow-primary/25 h-10 px-5 text-sm"
                    >
                        <Plus size={18} />
                        Novo Grupo
                    </Button>
                }
            />

            {grupos.length === 0 ? (
                <EmptyState
                    icon={Tv}
                    title="Nenhum grupo cadastrado"
                    description="Crie grupos para agrupar seus streamings e facilitar o envio de mensagens de renovação via WhatsApp."
                />
            ) : (
                <div className="space-y-6">
                    <SectionHeader
                        title="Seus Grupos"
                        className="mb-0"
                        rightElement={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
                    />
                    {viewMode === "grid" ? (
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
                    )}
                </div>
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
