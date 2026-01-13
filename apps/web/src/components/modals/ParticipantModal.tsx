"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface ParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ParticipantFormData) => void;
    participant?: {
        nome: string;
        whatsappNumero: string;
        cpf: string;
        email?: string;
    };
    loading?: boolean;
}

export interface ParticipantFormData {
    nome: string;
    whatsappNumero: string;
    cpf: string;
    email?: string;
}

export function ParticipantModal({
    isOpen,
    onClose,
    onSave,
    participant,
    loading,
}: ParticipantModalProps) {
    const [formData, setFormData] = useState<ParticipantFormData>(
        participant || {
            nome: "",
            whatsappNumero: "",
            cpf: "",
            email: "",
        }
    );
    const [errors, setErrors] = useState<Partial<Record<keyof ParticipantFormData, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<keyof ParticipantFormData, string>> = {};
        if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
        if (!formData.whatsappNumero.trim()) newErrors.whatsappNumero = "WhatsApp é obrigatório";
        if (!formData.cpf.trim()) {
            newErrors.cpf = "CPF é obrigatório";
        } else if (formData.cpf.replace(/\D/g, "").length !== 11) {
            newErrors.cpf = "CPF deve ter 11 dígitos";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    const handleChange = (field: keyof ParticipantFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
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
                        disabled={loading}
                        className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                    >
                        {loading ? "Processando..." : (participant ? "Salvar" : "Criar")}
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
                    error={errors.nome}
                    required
                />
                <Input
                    label="WhatsApp"
                    type="tel"
                    value={formData.whatsappNumero}
                    onChange={(e) => handleChange("whatsappNumero", e.target.value)}
                    placeholder="(11) 98765-4321"
                    error={errors.whatsappNumero}
                    required
                />
                <Input
                    label="CPF"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="123.456.789-00"
                    error={errors.cpf}
                    required
                />
                <Input
                    label="Email (opcional)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="maria@email.com"
                    error={errors.email}
                />
            </form>
        </Modal>
    );
}
