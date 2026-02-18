"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useStreamingStore } from "@/stores";
import { StreamingFormData } from "@/components/modals/StreamingModal";
import { upsertStreamingCredentials } from "@/actions/streamings";

export function useStreamingActions() {
    const toast = useToast();
    const {
        createStreaming: createStore,
        updateStreaming: updateStore,
        deleteStreaming: deleteStore
    } = useStreamingStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStreaming, setSelectedStreaming] = useState<any | null>(null);

    const handleAdd = async (data: StreamingFormData) => {
        try {
            const result = await createStore({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
                isPublico: data.isPublico,
            });

            // Save credentials if provided
            if (result && (data.credLogin || data.credSenha)) {
                await upsertStreamingCredentials(result.id, {
                    login: data.credLogin || null,
                    senha: data.credSenha || null,
                });
            }

            toast.success("Streaming criado com sucesso!");
            setIsAddModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = async (data: StreamingFormData & { updateExistingSubscriptions?: boolean }) => {
        if (!selectedStreaming) return;

        try {
            const result = await updateStore(selectedStreaming.id, {
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: typeof data.valorIntegral === 'string' ? parseFloat(data.valorIntegral) : data.valorIntegral,
                limiteParticipantes: parseInt(data.limiteParticipantes),
                isPublico: data.isPublico,
                updateExistingSubscriptions: data.updateExistingSubscriptions,
            });

            // Save credentials if provided
            if (data.credLogin !== undefined || data.credSenha !== undefined) {
                await upsertStreamingCredentials(selectedStreaming.id, {
                    login: data.credLogin || null,
                    senha: data.credSenha || null,
                });
            }

            if (result.updatedSubscriptions && result.updatedSubscriptions > 0) {
                toast.success(`Streaming atualizado! ${result.updatedSubscriptions} assinatura(s) atualizadas.`);
            } else {
                toast.success("Streaming atualizado com sucesso!");
            }

            setIsEditModalOpen(false);
            setSelectedStreaming(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!selectedStreaming) return;

        try {
            await deleteStore(selectedStreaming.id);
            toast.success("Streaming removido do catálogo");
            setIsDeleteModalOpen(false);
            setSelectedStreaming(null);
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (streaming: any) => {
        setSelectedStreaming(streaming);
        setIsEditModalOpen(true);
    };

    const openDelete = (streaming: any) => {
        setSelectedStreaming(streaming);
        setIsDeleteModalOpen(true);
    };

    return {
        modals: {
            add: { isOpen: isAddModalOpen, setOpen: setIsAddModalOpen },
            edit: { isOpen: isEditModalOpen, setOpen: setIsEditModalOpen },
            del: { isOpen: isDeleteModalOpen, setOpen: setIsDeleteModalOpen },
        },
        selectedStreaming,
        actions: {
            handleAdd,
            handleEdit,
            handleDelete,
            openEdit,
            openDelete
        }
    };
}
