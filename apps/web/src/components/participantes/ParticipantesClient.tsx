"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { ParticipantCard } from "@/components/participantes/ParticipantCard";
import { ParticipantModal, ParticipantFormData } from "@/components/modals/ParticipantModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { createParticipante, updateParticipante, deleteParticipante } from "@/actions/participantes";

interface Participante {
    id: number;
    nome: string;
    whatsappNumero: string;
    cpf: string;
    email?: string | null;
    _count: {
        assinaturas: number;
    };
}

interface ParticipantesClientProps {
    initialData: Participante[];
}

export function ParticipantesClient({ initialData }: ParticipantesClientProps) {
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
                p.cpf.includes(search)
            );
        });
    }, [initialData, searchTerm]);

    // Actions
    const handleAdd = async (data: ParticipantFormData) => {
        setLoading(true);
        try {
            await createParticipante(data);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error creating participant:", error);
            alert("Erro ao criar participante. Verifique se o CPF ou WhatsApp já estão em uso.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (data: ParticipantFormData) => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await updateParticipante(selectedParticipant.id, data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating participant:", error);
            alert("Erro ao atualizar participante.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await deleteParticipante(selectedParticipant.id);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting participant:", error);
            alert("Erro ao excluir participante.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>
                    <p className="text-gray-500 font-medium">Gerencie os participantes das assinaturas</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                    <Plus size={20} />
                    Novo Participante
                </button>
            </header>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter size={20} />
                    Filtros
                </button>
            </div>

            {/* Stats (Real time) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total de Participantes</p>
                    <p className="text-3xl font-bold text-gray-900">{initialData.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Com Assinaturas</p>
                    <p className="text-3xl font-bold text-green-600">
                        {initialData.filter((p) => p._count.assinaturas > 0).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Sem Assinaturas</p>
                    <p className="text-3xl font-bold text-gray-400">
                        {initialData.filter((p) => p._count.assinaturas === 0).length}
                    </p>
                </div>
            </div>

            {/* Participants Grid */}
            {filteredParticipants.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredParticipants.map((p) => (
                        <ParticipantCard
                            key={p.id}
                            id={p.id}
                            name={p.nome}
                            whatsapp={p.whatsappNumero}
                            email={p.email || undefined}
                            cpf={p.cpf}
                            subscriptionsCount={p._count.assinaturas}
                            totalValue="0.00" // Still dynamic if we calculate it server-side or here
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
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg">Nenhum participante encontrado.</p>
                </div>
            )}

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
                            cpf: selectedParticipant.cpf,
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
        </div>
    );
}
