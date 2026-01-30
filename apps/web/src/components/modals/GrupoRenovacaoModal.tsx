"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Copy, ExternalLink, Check, Calendar } from "lucide-react";
import { gerarMensagemRenovacao } from "@/actions/grupos";
import { generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { useToast } from "@/hooks/useToast";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GrupoRenovacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    grupoId: number;
    grupoNome: string;
}

export function GrupoRenovacaoModal({
    isOpen,
    onClose,
    grupoId,
    grupoNome,
}: GrupoRenovacaoModalProps) {
    const toast = useToast();
    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mesReferencia, setMesReferencia] = useState(new Date());

    // Generate available months (current + next 2 + previous 1)
    const mesesDisponiveis = [
        subMonths(new Date(), 1),
        new Date(),
        addMonths(new Date(), 1),
        addMonths(new Date(), 2),
    ];

    useEffect(() => {
        if (isOpen) {
            loadMensagem();
        }
    }, [isOpen, mesReferencia]);

    const loadMensagem = async () => {
        setLoading(true);
        try {
            const texto = await gerarMensagemRenovacao(grupoId, mesReferencia);
            setMensagem(texto);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao gerar mensagem");
            setMensagem("");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(mensagem);
            setCopied(true);
            toast.success("Mensagem copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Erro ao copiar mensagem");
        }
    };

    const handleOpenWhatsApp = () => {
        if (!mensagem) return;
        try {
            const link = generateWhatsAppLinkTextOnly(mensagem);
            window.open(link, "_blank");
        } catch {
            toast.error("Erro ao abrir WhatsApp");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Renovação - ${grupoNome}`}
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={loading || !mensagem}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copiado!" : "Copiar"}
                    </button>
                    <button
                        onClick={handleOpenWhatsApp}
                        disabled={loading || !mensagem}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <ExternalLink size={18} />
                        Abrir WhatsApp
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Month Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={14} className="inline mr-1" />
                        Mês de Referência
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {mesesDisponiveis.map((mes) => {
                            const isSelected =
                                format(mes, "yyyy-MM") === format(mesReferencia, "yyyy-MM");
                            return (
                                <button
                                    key={mes.toISOString()}
                                    onClick={() => setMesReferencia(mes)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isSelected
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {format(mes, "MMMM/yy", { locale: ptBR })}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview da Mensagem
                    </label>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
                            <Spinner size="md" />
                            <span className="ml-3 text-gray-500">Gerando mensagem...</span>
                        </div>
                    ) : mensagem ? (
                        <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                                {mensagem}
                            </pre>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            <p>Nenhuma mensagem para exibir.</p>
                            <p className="text-sm mt-1">
                                Verifique se o grupo possui streamings com assinaturas ativas.
                            </p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t">
                    <span>✅ Pago</span>
                </div>
            </div>
        </Modal>
    );
}
