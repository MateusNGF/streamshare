"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface ParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ParticipantFormData) => void;
    participant?: ParticipantFormData;
}

export interface ParticipantFormData {
    nome: string;
    whatsapp: string;
    cpf: string;
    email?: string;
}

export function ParticipantModal({
    isOpen,
    onClose,
    onSave,
    participant,
}: ParticipantModalProps) {
    const [formData, setFormData] = useState<ParticipantFormData>(
        participant || {
            nome: "",
            whatsapp: "",
            cpf: "",
            email: "",
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (field: keyof ParticipantFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={participant ? "Editar Participante" : "Novo Participante"}
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                    >
                        {participant ? "Salvar" : "Criar"}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nome Completo"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Ex: Maria Silva"
                    required
                />
                <Input
                    label="WhatsApp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="(11) 98765-4321"
                    required
                />
                <Input
                    label="CPF"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="123.456.789-00"
                    required
                />
                <Input
                    label="Email (opcional)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="maria@email.com"
                />
            </form>
        </Modal>
    );
}
