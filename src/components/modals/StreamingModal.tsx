"use client";

import { useState, useEffect } from "react";
import { Globe, Info, Lock, LockOpen } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { CatalogoPicker } from "@/components/streamings/CatalogoPicker";
import { getCatalogos } from "@/actions/streamings";
import { cn } from "@/lib/utils";
import { StreamingSchema } from "@/lib/schemas";
import { ZodIssue } from "zod";
import { useCurrency } from "@/hooks/useCurrency";
import { getNextStreamingNumber } from "@/actions/streamings";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Switch } from "@/components/ui/switch";
import { QuantityInput } from "@/components/ui/QuantityInput";

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
    valorIntegral: number | string;
    limiteParticipantes: string;
    isPublico?: boolean; // Added optional field
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
            limiteParticipantes: "1",
            isPublico: false, // Default to private
        }
    );
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [updateExistingSubscriptions, setUpdateExistingSubscriptions] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof StreamingFormData, string>>>({});
    const { currencyInfo } = useCurrency();

    const validate = () => {
        const result = StreamingSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors: Partial<Record<keyof StreamingFormData, string>> = {};
            result.error.issues.forEach((issue: ZodIssue) => {
                if (issue.path[0]) {
                    formattedErrors[issue.path[0] as keyof StreamingFormData] = issue.message;
                }
            });
            setErrors(formattedErrors);
            return false;
        }

        setErrors({});
        return true;
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
                valorIntegral: "", // Empty string by default
                limiteParticipantes: "1",
                isPublico: false,
            }));
        }
    }, [streaming, isOpen]);

    const selectedCatalogo = catalogos.find(c => String(c.id) === formData.catalogoId);

    const handleNextStep = async () => {
        if (step === 1 && !formData.apelido && selectedCatalogo) {
            try {
                // Auto-fill apelido with count logic from server
                const nextNumber = await getNextStreamingNumber(Number(formData.catalogoId));
                setFormData(prev => ({ ...prev, apelido: `${selectedCatalogo.nome} ${nextNumber}` }));
            } catch (error) {
                console.error("Error fetching next streaming number:", error);
            }
        }
        setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // Prevent double submit
        if (validate()) {
            onSave({ ...formData, updateExistingSubscriptions });
        }
    };

    const handleChange = (field: keyof StreamingFormData, value: boolean | string) => {
        // @ts-ignore - dynamic key assignment with mixed types
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
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    {step === 2 && !streaming && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="w-full sm:w-auto sm:mr-auto px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Voltar
                        </button>
                    )}
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={!formData.catalogoId}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 text-sm sm:text-base ml-auto"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || catalogos.length === 0}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2 ml-auto"
                        >
                            {loading && <Spinner size="sm" color="white" />}
                            {loading ? "Processando..." : streaming ? "Salvar" : "Criar"}
                        </button>
                    )}
                </div>
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
                        {loadingCatalog ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <CatalogoPicker
                                items={catalogos}
                                value={formData.catalogoId}
                                onChange={async (val) => {
                                    handleChange("catalogoId", val);

                                    // Auto-fill name logic from server for the auto-advance interaction
                                    const selectedCat = catalogos.find(c => String(c.id) === val);
                                    if (selectedCat) {
                                        try {
                                            const nextNumber = await getNextStreamingNumber(Number(val));
                                            setFormData(prev => ({ ...prev, apelido: `${selectedCat.nome} ${nextNumber}` }));
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }

                                    setTimeout(() => setStep(2), 100); // Slight delay for better UX
                                }}
                                disabled={!!streaming}
                            />
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {selectedCatalogo && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                                <StreamingLogo
                                    name={selectedCatalogo.nome}
                                    color={selectedCatalogo.corPrimaria}
                                    iconeUrl={selectedCatalogo.iconeUrl}
                                    size="lg"
                                />
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Serviço Selecionado</p>
                                    <p className="text-gray-900 font-bold">{selectedCatalogo.nome}</p>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Nome do Streaming"
                            type="text"
                            value={formData.apelido}
                            onChange={(e) => handleChange("apelido", e.target.value)}
                            placeholder={selectedCatalogo?.nome || "Ex: Netflix Família"}
                            error={errors.apelido}
                            required
                            className="mb-4"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <CurrencyInput
                                label="Valor Integral (Mensal)"
                                value={formData.valorIntegral}
                                onValueChange={(val) => handleChange("valorIntegral", val === undefined ? "" : String(val))}
                                placeholder="R$ 0,00"
                                error={errors.valorIntegral}
                                required
                            />
                            <QuantityInput
                                label="Limite de Vagas"
                                value={formData.limiteParticipantes}
                                onValueChange={(val) => handleChange("limiteParticipantes", String(val))}
                                error={errors.limiteParticipantes}
                                min={1}
                                max={10} // Just as a safe default for common shared accounts
                                className="w-full"
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
                                            <li><strong>Valor:</strong> Mudanças afetarão apenas novas cobranças</li>
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
                                                    Atualizar o valor das <strong>{formData.activeSubscriptions} assinatura(s) existente(s)</strong> para {currencyInfo.symbol} {formData.valorIntegral}
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}


                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className={cn(
                                "p-2 rounded-xl border transition-all duration-300",
                                formData.isPublico
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-gray-50 border-gray-100"
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-2.5 rounded-xl flex items-center justify-center transition-colors",
                                        formData.isPublico ? "bg-primary border text-white shadow-lg shadow-primary/25" : "bg-white border border-gray-200 text-gray-400"
                                    )}>
                                        {formData.isPublico ? (
                                            <LockOpen size={20} strokeWidth={2.5} />
                                        ) : (
                                            <Lock size={20} strokeWidth={2.5} />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <label
                                                className="text-sm font-bold text-gray-900 cursor-pointer select-none"
                                                onClick={() => handleChange("isPublico", !formData.isPublico)}
                                            >
                                                Visibilidade Pública
                                            </label>
                                            <Switch
                                                checked={formData.isPublico}
                                                onCheckedChange={(checked) => handleChange("isPublico", checked)}
                                            />
                                        </div>

                                        <p className="text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                            Permitir que este streaming apareça no <strong>Explorer</strong> para outros usuários da comunidade solicitarem entrada.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}
