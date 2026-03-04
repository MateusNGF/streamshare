"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Tv } from "lucide-react";
import { useActionError } from "@/hooks/useActionError";
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
import { GenericFilter } from "@/components/ui/GenericFilter";

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
    error?: string;
}

export function GruposClient({ initialGrupos, error }: GruposClientProps) {
    const toast = useToast();
    useActionError(error);
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

    const [searchTerm, setSearchTerm] = useState("");

    // Filter logic
    const filteredGrupos = grupos.filter((g) => {
        if (!searchTerm) return true;
        return g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <PageContainer>
            <PageHeader
                title="Grupos"
                description="Agrupe seus streamings para facilitar a geração de mensagens de renovação"
                action={
                    <Button onClick={handleOpenCreate}>
                        <Plus size={18} className="mr-2" />
                        Novo Grupo
                    </Button>
                }
            />

            {grupos.length === 0 ? (
                <EmptyState
                    icon={Tv}
                    title="Nenhum grupo"
                    description="Agrupe streamings para facilitar a renovação."
                    action={
                        <Button onClick={handleOpenCreate}>Criar Novo Grupo</Button>
                    }
                />
            ) : (
                <>
                    <div className="py-6">
                        <GenericFilter
                            filters={[
                                {
                                    key: "searchTerm",
                                    type: "text",
                                    placeholder: "Buscar grupos por nome ou descrição..."
                                }
                            ]}
                            values={{ searchTerm }}
                            onChange={(key, value) => {
                                if (key === "searchTerm") setSearchTerm(value);
                            }}
                            onClear={() => setSearchTerm("")}
                        />
                    </div>

                    <div className="space-y-4">
                        <SectionHeader
                            title="Seus Grupos"
                            rightElement={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
                        />
                        {filteredGrupos.length === 0 ? (
                            <EmptyState
                                icon={Tv}
                                title="Nenhum grupo encontrado"
                                description="Tente ajustar sua busca."
                                variant="glass"
                            />
                        ) : viewMode === "grid" ? (
                            <GruposGrid
                                grupos={filteredGrupos}
                                onRenovacao={handleOpenRenovacao}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ) : (
                            <GruposTable
                                grupos={filteredGrupos}
                                onRenovacao={handleOpenRenovacao}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        )}
                    </div>
                </>
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
