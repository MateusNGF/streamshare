"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { CatalogoPicker } from "@/components/streamings/CatalogoPicker";
import { getCatalogos } from "@/actions/streamings";
import { cn } from "@/lib/utils";

interface StreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: StreamingFormData & { updateExistingSubscriptions?: boolean }) => void;
    streaming?: StreamingFormData & { activeSubscriptions?: number };
    loading?: boolean;
}

export interface StreamingFormData {
    catalogoId: string;
    apelido: string;
    valorIntegral: string;
    limiteParticipantes: string;
    activeSubscriptions?: number;
}

export function StreamingModal({
    isOpen,
    onClose,
    onSave,
    streaming,
    loading,
}: StreamingModalProps) {
    const [step, setStep] = useState(1);
    const [catalogos, setCatalogos] = useState<{ id: number; nome: string; iconeUrl: string | null; corPrimaria: string }[]>([]);
    const [formData, setFormData] = useState<StreamingFormData>(
        streaming || {
            catalogoId: "",
            apelido: "",
            valorIntegral: "",
            limiteParticipantes: "",
        }
    );
    const [updateExistingSubscriptions, setUpdateExistingSubscriptions] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof StreamingFormData, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<keyof StreamingFormData, string>> = {};
        if (!formData.catalogoId) newErrors.catalogoId = "Selecione um serviço";

        if (!formData.apelido || !formData.apelido.trim()) {
            newErrors.apelido = "Nome do streaming é obrigatório";
        }

        const valor = parseFloat(formData.valorIntegral);
        if (isNaN(valor) || valor <= 0) {
            newErrors.valorIntegral = "Valor deve ser maior que zero";
        }

        const limite = parseInt(formData.limiteParticipantes);
        if (isNaN(limite) || limite <= 0) {
            newErrors.limiteParticipantes = "Limite deve ser maior que zero";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        async function fetchCatalogos() {
            try {
                const data = await getCatalogos();
                setCatalogos(data);
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
            setStep(2); // Start at step 2 when editing
        } else if (isOpen && !streaming) {
            setStep(1); // Start at step 1 when creating
            setFormData(prev => ({
                ...prev,
                apelido: "",
                valorIntegral: "",
                limiteParticipantes: "",
            }));
        }
    }, [streaming, isOpen]);

    const selectedCatalogo = catalogos.find(c => String(c.id) === formData.catalogoId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ ...formData, updateExistingSubscriptions });
        }
    };

    const handleChange = (field: keyof StreamingFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={streaming ? "Editar Streaming" : "Novo Streaming"}
            footer={
                <>
                    {step === 2 && !streaming && (
                        <button
                            onClick={() => setStep(1)}
                            className="mr-auto px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base"
                    >
                        Cancelar
                    </button>
                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.catalogoId}
                            className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 text-sm sm:text-base"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || catalogos.length === 0}
                            className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
                        >
                            {loading && <Spinner size="sm" color="white" />}
                            {loading ? "Processando..." : streaming ? "Salvar" : "Criar"}
                        </button>
                    )}
                </>
            }
        >
            <div className="mb-8 flex items-center gap-4 max-w-xs mx-auto">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                    step === 1 ? "bg-primary border-primary text-white" : "bg-green-100 border-green-200 text-green-600"
                )}>
                    {step === 1 ? "1" : "✓"}
                </div>
                <div className="h-px bg-gray-100 flex-1" />
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                    step === 2 ? "bg-primary border-primary text-white" : "bg-gray-50 border-gray-200 text-gray-400"
                )}>
                    2
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Selecione o Serviço do Catálogo
                        </label>
                        <CatalogoPicker
                            items={catalogos}
                            value={formData.catalogoId}
                            onChange={(val) => {
                                handleChange("catalogoId", val);
                                setTimeout(() => setStep(2), 300); // Slight delay for better UX
                            }}
                            disabled={!!streaming}
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {selectedCatalogo && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                                    style={{ backgroundColor: selectedCatalogo.corPrimaria }}
                                >
                                    {selectedCatalogo.iconeUrl ? (
                                        <img src={selectedCatalogo.iconeUrl} alt={selectedCatalogo.nome} className="w-8 h-8 object-contain brightness-0 invert" />
                                    ) : (
                                        selectedCatalogo.nome.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Serviço Selecionado</p>
                                    <p className="text-gray-900 font-bold">{selectedCatalogo.nome}</p>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Nome do Streaming"
                            type="text"
                            value={formData.apelido || selectedCatalogo?.nome}
                            onChange={(e) => handleChange("apelido", e.target.value)}
                            placeholder={selectedCatalogo?.nome || "Ex: Netflix Família"}
                            error={errors.apelido}
                            required
                            className="mb-4"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Valor Integral (Mensal)"
                                type="number"
                                step="0.01"
                                value={formData.valorIntegral}
                                onChange={(e) => handleChange("valorIntegral", e.target.value)}
                                placeholder="55.90"
                                error={errors.valorIntegral}
                                required
                            />
                            <Input
                                label="Limite de Vagas"
                                type="number"
                                value={formData.limiteParticipantes}
                                onChange={(e) => handleChange("limiteParticipantes", e.target.value)}
                                placeholder="5"
                                error={errors.limiteParticipantes}
                                required
                            />
                        </div>

                        {/* Active Subscriptions Warning */}
                        {streaming && formData.activeSubscriptions !== undefined && formData.activeSubscriptions > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-bold">!</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 mb-1">Atenção: Assinaturas Ativas</p>
                                        <p className="text-xs text-amber-700 mb-2">
                                            Este streaming possui <strong>{formData.activeSubscriptions} assinatura(s) ativa(s)</strong>.
                                        </p>
                                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                            <li><strong>Limite de vagas:</strong> Não pode ser menor que {formData.activeSubscriptions}</li>
                                            <li><strong>Valor:</strong> Mudanças afetarão apenas novas assinaturas (a menos que você marque a opção abaixo)</li>
                                        </ul>

                                        {/* Option to update existing subscriptions when value changes */}
                                        {streaming.valorIntegral !== formData.valorIntegral && (
                                            <label className="flex items-start gap-2 mt-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={updateExistingSubscriptions}
                                                    onChange={(e) => setUpdateExistingSubscriptions(e.target.checked)}
                                                    className="mt-0.5 w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                                <span className="text-xs text-amber-800 group-hover:text-amber-900">
                                                    Atualizar o valor das <strong>{formData.activeSubscriptions} assinatura(s) existente(s)</strong> para R$ {formData.valorIntegral}
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                            * Configure o valor total que você paga pelo serviço e o limite de vagas disponíveis.
                        </p>
                    </div>
                )}
            </form>
        </Modal>
    );
}
