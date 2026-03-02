"use client";

import { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Tv, Check, Users } from "lucide-react";
import { createGrupo, updateGrupo, getStreamingsParaGrupo, getGrupoById } from "@/actions/grupos";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

type Streaming = {
    id: number;
    apelido: string | null;
    valorIntegral: any; // Accepts number | string | Prisma.Decimal
    limiteParticipantes: number;
    catalogo: {
        id: number;
        nome: string;
        iconeUrl: string | null;
        corPrimaria: string;
    };
    _count: {
        assinaturas: number;
    };
};

type Grupo = {
    id: number;
    nome: string;
    descricao: string | null;
} | null;

interface GrupoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    grupo: Grupo;
}

export function GrupoFormModal({
    isOpen,
    onClose,
    onSuccess,
    grupo,
}: GrupoFormModalProps) {
    const toast = useToast();
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [selectedStreamingIds, setSelectedStreamingIds] = useState<number[]>([]);
    const [streamings, setStreamings] = useState<Streaming[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<{ nome?: string; streamings?: string }>({});
    const { format } = useCurrency();

    // Load streamings on mount
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getStreamingsParaGrupo()
                .then((result) => {
                    if (result.success && result.data) {
                        setStreamings(result.data);
                    } else if (result.error) {
                        toast.error(result.error);
                    }
                })
                .catch(() => toast.error("Erro ao carregar streamings"))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    // Load grupo data when editing
    useEffect(() => {
        if (isOpen && grupo) {
            setNome(grupo.nome);
            setDescricao(grupo.descricao || "");
            // Fetch full grupo data to get streaming IDs
            getGrupoById(grupo.id)
                .then((result) => {
                    if (result.success && result.data) {
                        setSelectedStreamingIds(result.data.streamings.map((gs) => gs.streaming.id));
                    } else if (result.error) {
                        toast.error(result.error);
                    }
                })
                .catch((err) => console.error(err));
        } else if (isOpen && !grupo) {
            // Reset form for new grupo
            setNome("");
            setDescricao("");
            setSelectedStreamingIds([]);
        }
    }, [isOpen, grupo]);

    const toggleStreaming = (id: number) => {
        setSelectedStreamingIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
        if (errors.streamings) {
            setErrors((prev) => ({ ...prev, streamings: undefined }));
        }
    };

    const validate = () => {
        const newErrors: { nome?: string; streamings?: string } = {};

        if (!nome.trim()) {
            newErrors.nome = "Nome é obrigatório";
        }

        if (selectedStreamingIds.length === 0) {
            newErrors.streamings = "Selecione pelo menos um streaming";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        startTransition(async () => {
            try {
                if (grupo) {
                    const result = await updateGrupo(grupo.id, {
                        nome,
                        descricao: descricao || undefined,
                        streamingIds: selectedStreamingIds,
                    });
                    if (result.success) {
                        toast.success("Grupo atualizado com sucesso!");
                        onSuccess();
                    } else if (result.error) {
                        toast.error(result.error);
                    }
                } else {
                    const result = await createGrupo({
                        nome,
                        descricao: descricao || undefined,
                        streamingIds: selectedStreamingIds,
                    });
                    if (result.success) {
                        toast.success("Grupo criado com sucesso!");
                        onSuccess();
                    } else if (result.error) {
                        toast.error(result.error);
                    }
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erro ao salvar grupo");
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={grupo ? "Editar Grupo" : "Novo Grupo"}
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
                        disabled={isPending || loading}
                        className="w-full sm:w-auto"
                    >
                        {isPending && <Spinner size="sm" color="white" />}
                        {isPending ? "Salvando..." : grupo ? "Salvar" : "Criar"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Nome do Grupo"
                    value={nome}
                    onChange={(e) => {
                        setNome(e.target.value);
                        if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }));
                    }}
                    placeholder="Ex: Renovação Janeiro"
                    error={errors.nome}
                    required
                />

                <Input
                    label="Descrição (opcional)"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Grupo de assinaturas mensais"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Streamings do Grupo
                    </label>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size="md" />
                        </div>
                    ) : streamings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Tv size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Nenhum streaming cadastrado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1">
                            {streamings.map((streaming) => {
                                const isSelected = selectedStreamingIds.includes(streaming.id);
                                return (
                                    <button
                                        key={streaming.id}
                                        type="button"
                                        onClick={() => toggleStreaming(streaming.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <StreamingLogo
                                            name={streaming.catalogo.nome}
                                            color={streaming.catalogo.corPrimaria}
                                            iconeUrl={streaming.catalogo.iconeUrl}
                                            size="md"
                                            rounded="lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {streaming.apelido || streaming.catalogo.nome}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    {format(streaming.valorIntegral)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={10} />
                                                    {streaming._count.assinaturas}/{streaming.limiteParticipantes}
                                                </span>
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {errors.streamings && (
                        <p className="mt-2 text-sm text-red-500">{errors.streamings}</p>
                    )}
                </div>
            </form>
        </Modal>
    );
}
