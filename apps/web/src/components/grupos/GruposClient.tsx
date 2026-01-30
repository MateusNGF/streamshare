"use client";

import { useState, useTransition } from "react";
import { Plus, MessageCircle, Pencil, Trash2, Tv } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { GrupoFormModal } from "@/components/modals/GrupoFormModal";
import { GrupoRenovacaoModal } from "@/components/modals/GrupoRenovacaoModal";
import { deleteGrupo } from "@/actions/grupos";
import { useToast } from "@/hooks/useToast";

type Grupo = {
    id: number;
    nome: string;
    descricao: string | null;
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
        <>
            <PageHeader
                title="Grupos"
                description="Agrupe seus streamings para facilitar a geração de mensagens de renovação"
                action={
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all"
                    >
                        <Plus size={20} />
                        Novo Grupo
                    </button>
                }
            />

            {grupos.length === 0 ? (
                <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Tv size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum grupo cadastrado</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Crie grupos para agrupar seus streamings e facilitar o envio de mensagens de renovação via WhatsApp.
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all"
                    >
                        <Plus size={20} />
                        Criar Primeiro Grupo
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grupos.map((grupo) => (
                        <div
                            key={grupo.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{grupo.nome}</h3>
                                    {grupo.descricao && (
                                        <p className="text-sm text-gray-500 mt-1">{grupo.descricao}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenRenovacao(grupo)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Gerar mensagem de renovação"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(grupo)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar grupo"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDelete(grupo)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir grupo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Tv size={16} className="text-gray-400" />
                                <span>{grupo._count.streamings} streaming(s)</span>
                            </div>
                        </div>
                    ))}
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
        </>
    );
}
