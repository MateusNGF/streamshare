"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { gerarPixCobranca } from "@/actions/cobrancas";
import { QrCode, Copy, CheckCircle2, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cobrancaId: number | null;
    valor?: number;
}

export function PixPaymentModal({
    isOpen,
    onClose,
    cobrancaId,
    valor
}: PixPaymentModalProps) {
    const { success, error } = useToast();
    const { format } = useCurrency();
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<{ qrCodeBase64: string; qrCode: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && cobrancaId && !pixData) {
            handleGeneratePix();
        }
    }, [isOpen, cobrancaId]);

    const handleGeneratePix = async () => {
        if (!cobrancaId) return;
        setLoading(true);
        try {
            const res = await gerarPixCobranca(cobrancaId);
            if (res.success && res.data) {
                setPixData({
                    qrCodeBase64: res.data.qrCodeBase64 || "",
                    qrCode: res.data.qrCode || ""
                });
            } else {
                error(res.error || "Erro ao gerar PIX");
                onClose();
            }
        } catch (err) {
            error("Erro inesperado ao gerar PIX");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!pixData?.qrCode) return;
        navigator.clipboard.writeText(pixData.qrCode);
        setCopied(true);
        success("Código PIX copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!cobrancaId && !loading) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pagamento via PIX"
            className="sm:max-w-md"
        >
            <div className="flex flex-col items-center py-4 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm font-medium text-gray-500">Gerando seu QR Code...</p>
                    </div>
                ) : pixData ? (
                    <>
                        <div className="text-center space-y-1">
                            <p className="text-sm text-gray-500 font-medium">Valor a pagar</p>
                            <h3 className="text-3xl font-black text-gray-900">{format(valor || 0)}</h3>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-xl group-hover:bg-primary/10 transition-colors" />
                            <div className="relative bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                                <img
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48 sm:w-56 sm:h-56"
                                />
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                                <div className="flex items-center gap-2 text-primary">
                                    <Smartphone size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Pix Copia e Cola</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-mono text-gray-500 truncate leading-relaxed">
                                        {pixData.qrCode}
                                    </div>
                                    <Button
                                        onClick={handleCopyCode}
                                        size="sm"
                                        className="shrink-0 h-10 px-4 rounded-xl"
                                    >
                                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                    Após o pagamento, o sistema identificará automaticamente em alguns minutos. Não é necessário enviar o comprovante.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full h-12 rounded-2xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Fechar
                        </Button>
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-gray-500">Falha ao carregar dados do pagamento.</p>
                        <Button onClick={handleGeneratePix} className="mt-4">Tentar novamente</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
