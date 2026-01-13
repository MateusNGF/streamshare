"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getCatalogos } from "@/actions/streamings";

interface StreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: StreamingFormData) => void;
    streaming?: StreamingFormData;
    loading?: boolean;
}

export interface StreamingFormData {
    catalogoId: string;
    valorIntegral: string;
    limiteParticipantes: string;
    dataVencimento: string;
}

export function StreamingModal({
    isOpen,
    onClose,
    onSave,
    streaming,
    loading,
}: StreamingModalProps) {
    const [catalogos, setCatalogos] = useState<{ value: string; label: string }[]>([]);
    const [formData, setFormData] = useState<StreamingFormData>(
        streaming || {
            catalogoId: "",
            valorIntegral: "",
            limiteParticipantes: "",
            dataVencimento: "",
        }
    );

    useEffect(() => {
        async function fetchCatalogos() {
            try {
                const data = await getCatalogos();
                setCatalogos(data.map(c => ({ value: String(c.id), label: c.nome })));
                if (!streaming && data.length > 0 && !formData.catalogoId) {
                    setFormData(prev => ({ ...prev, catalogoId: String(data[0].id) }));
                }
            } catch (error) {
                console.error("Error fetching catalogos:", error);
            }
        }
        if (isOpen) {
            fetchCatalogos();
        }
    }, [isOpen, streaming]);

    // Sync state when editing
    useEffect(() => {
        if (streaming) {
            setFormData(streaming);
        } else if (isOpen && !streaming) {
            // Reset for new item, but keep catalog if already set by fetch
            setFormData(prev => ({
                ...prev,
                valorIntegral: "",
                limiteParticipantes: "",
                dataVencimento: "",
            }));
        }
    }, [streaming, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.catalogoId) {
            alert("Selecione um serviço do catálogo.");
            return;
        }
        onSave(formData);
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
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || catalogos.length === 0}
                        className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 text-sm sm:text-base"
                    >
                        {loading ? "Processando..." : streaming ? "Salvar" : "Criar"}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Serviço do Catálogo"
                    options={catalogos}
                    value={formData.catalogoId}
                    onChange={(e) => handleChange("catalogoId", e.target.value)}
                    required
                    disabled={!!streaming} // Optional: usually you won't change the catalog item itself once created
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Valor Integral (Mensal)"
                        type="number"
                        step="0.01"
                        value={formData.valorIntegral}
                        onChange={(e) => handleChange("valorIntegral", e.target.value)}
                        placeholder="55.90"
                        required
                    />
                    <Input
                        label="Limite de Vagas"
                        type="number"
                        value={formData.limiteParticipantes}
                        onChange={(e) => handleChange("limiteParticipantes", e.target.value)}
                        placeholder="5"
                        required
                    />
                </div>
                <Input
                    label="Próximo Vencimento Master"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => handleChange("dataVencimento", e.target.value)}
                    required
                />
                <p className="text-xs text-gray-400 mt-2">
                    * Configure o valor total que você paga pelo serviço e o limite de vagas disponíveis.
                </p>
            </form>
        </Modal>
    );
}
