"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { ParticipantCard } from "@/components/participantes/ParticipantCard";
import { ParticipantModal, ParticipantFormData } from "@/components/modals/ParticipantModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { createParticipante, updateParticipante, deleteParticipante } from "@/actions/participantes";
import { useToast } from "@/hooks/useToast";

interface Participante {
    id: number;
    nome: string;
    whatsappNumero: string;
    cpf: string | null;
    email?: string | null;
    _count: {
        assinaturas: number;
    };
}

interface ParticipantesClientProps {
    initialData: Participante[];
}

export function ParticipantesClient({ initialData }: ParticipantesClientProps) {
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(null);
    const [loading, setLoading] = useState(false);

    // Filter logic
    const filteredParticipants = useMemo(() => {
        return initialData.filter((p) => {
            const search = searchTerm.toLowerCase();
            return (
                p.nome.toLowerCase().includes(search) ||
                p.whatsappNumero.includes(search) ||
                (p.cpf && p.cpf.includes(search))
            );
        });
    }, [initialData, searchTerm]);

    // Actions
    const handleAdd = async (data: ParticipantFormData) => {
        setLoading(true);
        try {
            await createParticipante(data);
            toast.success("Participante criado com sucesso!");
            setIsAddModalOpen(false);
        } catch (error) {
            toast.error("CPF ou WhatsApp já estão em uso");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (data: ParticipantFormData) => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await updateParticipante(selectedParticipant.id, data);
            toast.success("Participante atualizado com sucesso!");
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error("Erro ao atualizar participante");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await deleteParticipante(selectedParticipant.id);
            toast.success("Participante excluído com sucesso!");
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Erro ao excluir participante");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Participantes"
                description="Gerencie os participantes das assinaturas"
                action={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        aria-label="Adicionar novo participante"
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation"
                    >
                        <Plus size={20} />
                        Novo Participante
                    </button>
                }
            />

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <GenericFilter
                    filters={[{
                        key: "search",
                        type: "text",
                        placeholder: "Buscar por nome, telefone ou CPF...",
                        className: "w-full"
                    }]}
                    values={{ search: searchTerm }}
                    onChange={(key: string, value: string) => setSearchTerm(value)}
                    onClear={() => setSearchTerm("")}
                />
            </div>

            {/* Stats (Real time) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total de Participantes</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{initialData.length}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Com Assinaturas</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">
                        {initialData.filter((p) => p._count.assinaturas > 0).length}
                    </p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Sem Assinaturas</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-400">
                        {initialData.filter((p) => p._count.assinaturas === 0).length}
                    </p>
                </div>
            </div>

            {/* Participants Grid */}
            <div aria-live="polite" aria-atomic="true">
                {filteredParticipants.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {filteredParticipants.map((p) => (
                            <ParticipantCard
                                key={p.id}
                                id={p.id}
                                name={p.nome}
                                whatsapp={p.whatsappNumero}
                                email={p.email || undefined}
                                cpf={p.cpf}
                                subscriptionsCount={p._count.assinaturas}
                                status={p._count.assinaturas > 0 ? "ativa" : "inativo"}
                                onEdit={() => {
                                    setSelectedParticipant(p);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={() => {
                                    setSelectedParticipant(p);
                                    setIsDeleteModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-base md:text-lg">Nenhum participante encontrado.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                loading={loading}
            />
            <ParticipantModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEdit}
                loading={loading}
                participant={
                    selectedParticipant
                        ? {
                            nome: selectedParticipant.nome,
                            whatsappNumero: selectedParticipant.whatsappNumero,
                            cpf: selectedParticipant.cpf ?? "",
                            email: selectedParticipant.email || "",
                        }
                        : undefined
                }
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Excluir Participante"
                message={`Tem certeza que deseja excluir ${selectedParticipant?.nome}? Esta ação removerá o participante da base de dados.`}
            />
        </PageContainer>
    );
}
