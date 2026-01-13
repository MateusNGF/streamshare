"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { ParticipantCard } from "@/components/participantes/ParticipantCard";
import { ParticipantModal, ParticipantFormData } from "@/components/modals/ParticipantModal";
import { DeleteModal } from "@/components/modals/DeleteModal";

export default function ParticipantesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<ParticipantFormData | null>(null);

    const handleAddParticipant = (data: ParticipantFormData) => {
        console.log("Adding participant:", data);
        // Here you would call your API to create the participant
    };

    const handleEditParticipant = (data: ParticipantFormData) => {
        console.log("Editing participant:", data);
        // Here you would call your API to update the participant
    };

    const handleDeleteParticipant = () => {
        console.log("Deleting participant");
        // Here you would call your API to delete the participant
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
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter size={20} />
                    Filtros
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total de Participantes</p>
                    <p className="text-3xl font-bold text-gray-900">47</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Participantes Ativos</p>
                    <p className="text-3xl font-bold text-green-600">42</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Suspensos</p>
                    <p className="text-3xl font-bold text-red-600">5</p>
                </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ParticipantCard
                    name="Maria Silva"
                    whatsapp="(11) 98765-4321"
                    email="maria@email.com"
                    cpf="123.456.789-00"
                    subscriptionsCount={2}
                    totalValue="22.69"
                    status="ativa"
                />
                <ParticipantCard
                    name="João Santos"
                    whatsapp="(21) 99876-5432"
                    email="joao@email.com"
                    cpf="987.654.321-00"
                    subscriptionsCount={1}
                    totalValue="8.72"
                    status="ativa"
                />
                <ParticipantCard
                    name="Ana Costa"
                    whatsapp="(31) 91234-5678"
                    cpf="456.789.123-00"
                    subscriptionsCount={1}
                    totalValue="11.30"
                    status="suspensa"
                />
                <ParticipantCard
                    name="Pedro Oliveira"
                    whatsapp="(41) 92345-6789"
                    email="pedro@email.com"
                    cpf="321.654.987-00"
                    subscriptionsCount={3}
                    totalValue="35.50"
                    status="ativa"
                />
            </div>

            {/* Modals */}
            <ParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddParticipant}
            />
            <ParticipantModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditParticipant}
                participant={selectedParticipant || undefined}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteParticipant}
                title="Excluir Participante"
                message={`Tem certeza que deseja excluir ${selectedParticipant?.nome}? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
}
