"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { generateStreamingShareLink } from "@/actions/streamings";
import { Copy, Globe, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface ShareStreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    streamingId: number;
    streamingName: string;
    publicToken?: string;
}

const EXPIRATION_OPTIONS = [
    { value: "30m", label: "30 Minutos", description: "Válido por 30 minutos" },
    { value: "1h", label: "1 Hora", description: "Válido por 60 minutos" },
    { value: "6h", label: "6 Horas", description: "Válido por 6 horas" },
    { value: "12h", label: "12 Horas", description: "Válido por 12 horas" },
    { value: "1d", label: "24 Horas", description: "Válido por 1 dia" },
    { value: "3d", label: "3 Dias", description: "Válido por 3 dias" },
    { value: "7d", label: "7 Dias", description: "Válido por 1 semana" },
    { value: "never", label: "Permanente", description: "Nunca expira" },
];

export function ShareStreamingModal({
    isOpen,
    onClose,
    streamingId,
    streamingName,
    publicToken
}: ShareStreamingModalProps) {
    const [expiration, setExpiration] = useState("1h");
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { success, error } = useToast();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const token = await generateStreamingShareLink(streamingId, expiration);
            const url = `${window.location.origin}/assinar/${token}`;
            setGeneratedLink(url);

            // Auto copy
            navigator.clipboard.writeText(url);
            setCopied(true);
            success("Link copiado para a área de transferência!");
        } catch (err) {
            error("Erro ao gerar link de compartilhamento");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setGeneratedLink("");
        setExpiration("1h");
    };

    const handleClose = () => {
        onClose();
        setTimeout(reset, 300); // Reset after animation
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={generatedLink ? "Link Criado" : `Compartilhar Streaming`}
            className="sm:max-w-md"
            footer={
                !generatedLink ? (
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                        Gerar Link de Convite
                    </Button>
                ) : (
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={reset}
                            className="flex-1 h-11"
                        >
                            Criar Outro
                        </Button>
                        <Button
                            onClick={handleClose}
                            className="flex-1 h-11"
                        >
                            Concluir
                        </Button>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {!generatedLink ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700">
                            <Globe className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm leading-relaxed">
                                Crie um link de convite para <strong>{streamingName}</strong>. Você pode definir um prazo de expiração para maior segurança.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block gap-2 flex items-center">
                                <Clock size={16} className="text-gray-400" />
                                Tempo de Expiração
                            </label>

                            <Select value={expiration} onValueChange={setExpiration}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-white hover:border-gray-300 transition-all font-medium text-gray-700">
                                    <SelectValue placeholder="Selecione o tempo..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {EXPIRATION_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="py-3">
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium text-gray-900">{option.label}</span>
                                                <span className="text-xs text-gray-500">{option.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Link Gerado com Sucesso!</h3>
                            <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                                Este link expira em <span className="font-medium text-gray-900">{EXPIRATION_OPTIONS.find(o => o.value === expiration)?.label}</span>. Envie para os participantes.
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center animate-pulse">
                            <p className="text-sm font-medium text-green-800">
                                O link foi copiado para sua área de transferência.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
