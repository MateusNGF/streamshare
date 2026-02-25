"use client";

import { useState, useEffect } from "react";
import { Globe, Info, Lock, LockOpen, KeyRound, Eye, EyeOff, Trash2, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { CatalogoPicker } from "@/components/streamings/CatalogoPicker";
import type { CatalogoItem } from "@/stores/useCatalogoStore";
import { getCatalogos, getStreamingCredentials, upsertStreamingCredentials, deleteStreamingCredentials } from "@/actions/streamings";
import { cn } from "@/lib/utils";
import { StreamingSchema } from "@/lib/schemas";
import { ZodIssue } from "zod";
import { useCurrency } from "@/hooks/useCurrency";
import { getNextStreamingNumber } from "@/actions/streamings";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Switch } from "@/components/ui/Switch";
import { QuantityInput } from "@/components/ui/QuantityInput";
import { useToast } from "@/hooks/useToast";

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
    isPublico?: boolean;
    activeSubscriptions?: number;
    credLogin?: string;
    credSenha?: string;
}

export function StreamingModal({
    isOpen,
    onClose,
    onSave,
    streaming,
    loading,
}: StreamingModalProps) {
    const [step, setStep] = useState(1);
    const [catalogos, setCatalogos] = useState<CatalogoItem[]>([]);
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
    const toast = useToast();

    // Credential state
    const [credLogin, setCredLogin] = useState("");
    const [credSenha, setCredSenha] = useState("");
    const [showCredSenha, setShowCredSenha] = useState(false);
    const [credLoading, setCredLoading] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);
    const [showCredSection, setShowCredSection] = useState(false);

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
                const result = await getCatalogos();
                if (result.success && result.data) {
                    setCatalogos(result.data);
                    if (!streaming && result.data.length > 0 && !formData.catalogoId) {
                        setFormData(prev => ({ ...prev, catalogoId: String(result.data![0].id) }));
                    }
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

    // Fetch credentials when editing a streaming
    useEffect(() => {
        if (streaming && isOpen && (streaming as any).id) {
            setCredLoading(true);
            getStreamingCredentials((streaming as any).id)
                .then(res => {
                    if (res.success && res.data) {
                        setCredLogin(res.data.login || "");
                        setCredSenha(res.data.senha || "");
                        setHasCredentials(true);
                        setShowCredSection(true);
                    } else {
                        setCredLogin("");
                        setCredSenha("");
                        setHasCredentials(false);
                        setShowCredSection(false);
                    }
                })
                .finally(() => setCredLoading(false));
        } else if (isOpen && !streaming) {
            setCredLogin("");
            setCredSenha("");
            setShowCredSenha(false);
            setHasCredentials(false);
            setShowCredSection(false);
        }
    }, [streaming, isOpen]);

    const selectedCatalogo = catalogos.find(c => String(c.id) === formData.catalogoId);

    const handleNextStep = async () => {
        if (step === 1 && !formData.apelido && selectedCatalogo) {
            try {
                // Auto-fill apelido with count logic from server
                const result = await getNextStreamingNumber(Number(formData.catalogoId));
                if (result.success && result.data) {
                    setFormData(prev => ({ ...prev, apelido: `${selectedCatalogo.nome} ${result.data}` }));
                }
            } catch (error) {
                console.error("Error fetching next streaming number:", error);
            }
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (validate()) {
            onSave({
                ...formData,
                updateExistingSubscriptions,
                credLogin: showCredSection ? credLogin : undefined,
                credSenha: showCredSection ? credSenha : undefined,
            });
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="w-full sm:w-auto sm:mr-auto"
                        >
                            Voltar
                        </Button>
                    )}
                    {step === 1 ? (
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleNextStep}
                            disabled={!formData.catalogoId}
                            className="w-full sm:w-auto ml-auto"
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleSubmit}
                            disabled={loading || catalogos.length === 0}
                            className="w-full sm:w-auto ml-auto"
                        >
                            {loading && <Spinner size="sm" color="white" />}
                            {loading ? "Processando..." : streaming ? "Salvar" : "Criar"}
                        </Button>
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
                                            const result = await getNextStreamingNumber(Number(val));
                                            if (result.success && result.data) {
                                                setFormData(prev => ({ ...prev, apelido: `${selectedCat.nome} ${result.data}` }));
                                            }
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

                        <div className="grid grid-cols-2 gap-4 items-start">
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

                        {/* ─── Credenciais Section ─── */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCredSection(!showCredSection)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                    showCredSection
                                        ? "bg-amber-50/50 border-amber-200 shadow-sm shadow-amber-100"
                                        : "bg-gray-50 border-gray-100 hover:bg-gray-100/80"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        showCredSection ? "bg-amber-100 text-amber-600" : "bg-white border border-gray-200 text-gray-400"
                                    )}>
                                        <KeyRound size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                showCredSection ? "text-amber-900" : "text-gray-700"
                                            )}>
                                                Credenciais de Acesso
                                            </span>
                                            {hasCredentials && (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    Configurado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">Opcional para faturamento e gestão</p>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={cn(
                                        "text-gray-400 transition-transform duration-300",
                                        showCredSection && "rotate-180 text-amber-600"
                                    )}
                                />
                            </button>

                            {showCredSection && (
                                <div className="mt-2 ml-4 pl-7 border-l-2 border-amber-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 relative">
                                    {/* Tree Connector Dots */}
                                    <div className="absolute -left-[9px] top-6 w-4 h-[2px] bg-amber-100" />
                                    <div className="absolute -left-[9px] top-[104px] w-4 h-[2px] bg-amber-100" />

                                    {credLoading ? (
                                        <div className="flex items-center gap-3 py-4">
                                            <Spinner size="sm" />
                                            <span className="text-xs text-gray-400 font-medium">Buscando credenciais seguras...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                <Input
                                                    label="Email / Nome de Usuário"
                                                    type="text"
                                                    value={credLogin}
                                                    onChange={(e) => setCredLogin(e.target.value)}
                                                    placeholder="email@exemplo.com"
                                                    className="bg-gray-50/30"
                                                />
                                                <div className="relative">
                                                    <Input
                                                        label="Senha da Conta"
                                                        type={showCredSenha ? "text" : "password"}
                                                        value={credSenha}
                                                        onChange={(e) => setCredSenha(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="bg-gray-50/30"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCredSenha(!showCredSenha)}
                                                        className="absolute right-3 top-[37px] p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-lg"
                                                    >
                                                        {showCredSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                <Info size={14} className="text-blue-500 mt-0.5" />
                                                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                                                    As credenciais são criptografadas (AES-256) antes de serem armazenadas. Somente participantes ativos podem visualizá-las.
                                                </p>
                                            </div>

                                            {hasCredentials && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!streaming || !(streaming as any).id) return;
                                                        if (!confirm("Tem certeza que deseja remover permanentemente estas credenciais?")) return;
                                                        const res = await deleteStreamingCredentials((streaming as any).id);
                                                        if (res.success) {
                                                            setCredLogin("");
                                                            setCredSenha("");
                                                            setHasCredentials(false);
                                                            setShowCredSection(false);
                                                            toast.success("Credenciais removidas com sucesso");
                                                        } else {
                                                            toast.error(res.error || "Erro ao remover credenciais");
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 font-bold transition-colors w-fit px-2 py-1 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                    Remover credenciais salvas
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}
