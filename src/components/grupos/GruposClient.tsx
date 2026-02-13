"use client";

import { useState, useTransition } from "react";
import { Plus, MessageCircle, Pencil, Trash2, Tv } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { GrupoFormModal } from "@/components/modals/GrupoFormModal";
import { GrupoRenovacaoModal } from "@/components/modals/GrupoRenovacaoModal";
import { deleteGrupo } from "@/actions/grupos";
import { useToast } from "@/hooks/useToast";
import { PageContainer } from "../layout/PageContainer";

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grupos.map((grupo) => {
                        // Aggregation logic
                        const aggregated = grupo.streamings.reduce((acc, item) => {
                            const name = item.streaming.apelido || item.streaming.catalogo.nome;
                            acc.set(name, (acc.get(name) || 0) + 1);
                            return acc;
                        }, new Map<string, number>());

                        const displayItems = Array.from(aggregated.entries());
                        const remainingCount = displayItems.length - 5;

                        return (
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

                                <div className="mt-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Tv size={16} className="text-gray-400" />
                                        <span>{grupo._count.streamings} assinaturas</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {displayItems.slice(0, 5).map(([name, count], i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs font-medium text-gray-600 flex items-center gap-1"
                                            >
                                                {name}
                                                {count > 1 && (
                                                    <span className="text-primary font-bold bg-primary/10 px-1 rounded-[4px] text-[10px]">
                                                        {count}
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                        {remainingCount > 0 && (
                                            <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-400">
                                                +{remainingCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
