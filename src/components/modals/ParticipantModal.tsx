"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Spinner } from "@/components/ui/Spinner";
import { AlertCircle } from "lucide-react";
import { validateCPF, validatePhone, validateEmail, ValidationMessages } from "@/lib/validation";

interface ParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ParticipantFormData) => void;
    participant?: {
        nome: string;
        whatsappNumero: string;
        cpf?: string;
        email?: string;
        userId?: number | null;
    };
    loading?: boolean;
}

export interface ParticipantFormData {
    nome: string;
    whatsappNumero?: string;
    cpf?: string;
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
        if (formData.cpf && formData.cpf.trim() !== "") {
            if (!validateCPF(formData.cpf)) {
                newErrors.cpf = ValidationMessages.cpf.invalid;
            }
        }

        // WhatsApp validation (optional)
        if (formData.whatsappNumero && formData.whatsappNumero.trim() !== "") {
            if (!validatePhone(formData.whatsappNumero)) {
                newErrors.whatsappNumero = ValidationMessages.phone.invalid;
            }
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
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto sm:mr-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading ? "Processando..." : (participant ? "Salvar" : "Criar")}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {participant?.userId && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex gap-3 items-start mb-4">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-1">Perfil Vinculado</p>
                            <p>Este participante gerencia o próprio perfil. Apenas o nome pode ser editado aqui para fins de organização interna.</p>
                        </div>
                    </div>
                )}
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
                    value={formData.whatsappNumero || ""}
                    onChange={(value) => handleChange("whatsappNumero", value)}
                    error={errors.whatsappNumero}
                    disabled={!!participant?.userId}
                />
                <MaskedInput
                    label="CPF"
                    type="text"
                    maskType="cpf"
                    value={formData.cpf}
                    onValueChange={(value) => handleChange("cpf", value)}
                    placeholder="123.456.789-00"
                    error={errors.cpf}
                    disabled={!!participant?.userId}
                />
                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="maria@email.com"
                    error={errors.email}
                    disabled={!!participant?.userId}
                />
            </form>
        </Modal>
    );
}
