"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { StreamingDetailCard } from "@/components/streamings/StreamingDetailCard";
import { StreamingModal, StreamingFormData } from "@/components/modals/StreamingModal";
import { DeleteModal } from "@/components/modals/DeleteModal";

export default function StreamingsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStreaming, setSelectedStreaming] = useState<StreamingFormData | null>(null);

    const handleAddStreaming = (data: StreamingFormData) => {
        console.log("Adding streaming:", data);
    };

    const handleEditStreaming = (data: StreamingFormData) => {
        console.log("Editing streaming:", data);
    };

    const handleDeleteStreaming = () => {
        console.log("Deleting streaming");
    };

    return (
        <div className="p-8 pb-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Streamings</h1>
                    <p className="text-gray-500 font-medium">Gerencie os serviços de streaming disponíveis</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                    <Plus size={20} />
                    Novo Streaming
                </button>
            </header>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar streaming..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter size={20} />
                    Filtros
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total de Streamings</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Vagas Ocupadas</p>
                    <p className="text-3xl font-bold text-primary">32/40</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Taxa de Ocupação</p>
                    <p className="text-3xl font-bold text-green-600">80%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Receita Total</p>
                    <p className="text-3xl font-bold text-gray-900">R$ 487,20</p>
                </div>
            </div>

            {/* Streamings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StreamingDetailCard
                    name="Netflix"
                    initial="N"
                    color="#E50914"
                    slots={{ occupied: 4, total: 5 }}
                    price="55.90"
                    dueDate="15/01"
                    frequency="Mensal"
                />
                <StreamingDetailCard
                    name="Spotify Family"
                    initial="S"
                    color="#1DB954"
                    slots={{ occupied: 6, total: 6 }}
                    price="34.90"
                    dueDate="20/01"
                    frequency="Mensal"
                />
                <StreamingDetailCard
                    name="Disney+"
                    initial="D"
                    color="#006E99"
                    slots={{ occupied: 1, total: 4 }}
                    price="33.90"
                    dueDate="10/01"
                    frequency="Mensal"
                />
                <StreamingDetailCard
                    name="HBO Max"
                    initial="H"
                    color="#9B37FF"
                    slots={{ occupied: 3, total: 5 }}
                    price="34.90"
                    dueDate="25/01"
                    frequency="Mensal"
                />
                <StreamingDetailCard
                    name="Amazon Prime"
                    initial="A"
                    color="#00A8E1"
                    slots={{ occupied: 4, total: 4 }}
                    price="14.90"
                    dueDate="30/01"
                    frequency="Mensal"
                />
                <StreamingDetailCard
                    name="YouTube Premium"
                    initial="Y"
                    color="#FF0000"
                    slots={{ occupied: 2, total: 5 }}
                    price="26.90"
                    dueDate="18/01"
                    frequency="Mensal"
                />
            </div>

            {/* Modals */}
            <StreamingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddStreaming}
            />
            <StreamingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditStreaming}
                streaming={selectedStreaming || undefined}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteStreaming}
                title="Excluir Streaming"
                message="Tem certeza que deseja excluir este streaming? Esta ação não pode ser desfeita."
            />
        </div>
    );
}
