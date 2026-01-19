"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Spinner } from "@/components/ui/Spinner";
import { validateCPF, validatePhone, validateEmail, ValidationMessages } from "@/lib/validation";

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

    // Update form data when participant prop changes
    useEffect(() => {
        if (participant) {
            setFormData(participant);
        }
    }, [participant]);

    const validate = () => {
        const newErrors: Partial<Record<keyof ParticipantFormData, string>> = {};

        // Nome validation
        if (!formData.nome.trim()) {
            newErrors.nome = ValidationMessages.name.required;
        }

        // CPF validation
        if (!formData.cpf.trim()) {
            newErrors.cpf = ValidationMessages.cpf.required;
        } else if (!validateCPF(formData.cpf)) {
            newErrors.cpf = ValidationMessages.cpf.invalid;
        }

        // WhatsApp validation
        if (!formData.whatsappNumero.trim()) {
            newErrors.whatsappNumero = ValidationMessages.phone.required;
        } else if (!validatePhone(formData.whatsappNumero)) {
            newErrors.whatsappNumero = ValidationMessages.phone.invalid;
        }

        // Email validation (optional field)
        if (formData.email && formData.email.trim() !== "") {
            if (!validateEmail(formData.email)) {
                newErrors.email = ValidationMessages.email.invalid;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Submit with clean values (numbers only for CPF and phone)
            onSave(formData);
        }
    };

    const handleChange = (field: keyof ParticipantFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
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
                        className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Spinner size="sm" color="white" />}
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
                <PhoneInput
                    label="WhatsApp"
                    value={formData.whatsappNumero}
                    onChange={(value) => handleChange("whatsappNumero", value)}
                    error={errors.whatsappNumero}
                    required
                />
                <MaskedInput
                    label="CPF"
                    type="text"
                    maskType="cpf"
                    value={formData.cpf}
                    onValueChange={(value) => handleChange("cpf", value)}
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
