"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface StreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: StreamingFormData) => void;
    streaming?: StreamingFormData;
}

export interface StreamingFormData {
    catalogo: string;
    valorIntegral: string;
    limiteParticipantes: string;
    dataVencimento: string;
    credenciaisLogin?: string;
    credenciaisSenha?: string;
}

const catalogOptions = [
    { value: "netflix", label: "Netflix" },
    { value: "spotify", label: "Spotify" },
    { value: "disney", label: "Disney+" },
    { value: "hbo", label: "HBO Max" },
    { value: "amazon", label: "Amazon Prime" },
    { value: "youtube", label: "YouTube Premium" },
];

export function StreamingModal({
    isOpen,
    onClose,
    onSave,
    streaming,
}: StreamingModalProps) {
    const [formData, setFormData] = useState<StreamingFormData>(
        streaming || {
            catalogo: "netflix",
            valorIntegral: "",
            limiteParticipantes: "",
            dataVencimento: "",
            credenciaisLogin: "",
            credenciaisSenha: "",
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (field: keyof StreamingFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={streaming ? "Editar Streaming" : "Novo Streaming"}
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
                        {streaming ? "Salvar" : "Criar"}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Serviço"
                    options={catalogOptions}
                    value={formData.catalogo}
                    onChange={(e) => handleChange("catalogo", e.target.value)}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Valor Integral"
                        type="number"
                        step="0.01"
                        value={formData.valorIntegral}
                        onChange={(e) => handleChange("valorIntegral", e.target.value)}
                        placeholder="55.90"
                        required
                    />
                    <Input
                        label="Limite de Participantes"
                        type="number"
                        value={formData.limiteParticipantes}
                        onChange={(e) => handleChange("limiteParticipantes", e.target.value)}
                        placeholder="5"
                        required
                    />
                </div>
                <Input
                    label="Data de Vencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => handleChange("dataVencimento", e.target.value)}
                    required
                />
                <Input
                    label="Login (opcional)"
                    type="text"
                    value={formData.credenciaisLogin}
                    onChange={(e) => handleChange("credenciaisLogin", e.target.value)}
                    placeholder="usuario@email.com"
                />
                <Input
                    label="Senha (opcional)"
                    type="password"
                    value={formData.credenciaisSenha}
                    onChange={(e) => handleChange("credenciaisSenha", e.target.value)}
                    placeholder="********"
                />
            </form>
        </Modal>
    );
}
