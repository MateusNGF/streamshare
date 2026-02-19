"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { Copy, CheckCircle, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";

interface PendingInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    checkoutData: {
        type: 'PIX' | 'CARD';
        qrCode?: string;
        copyPaste?: string;
        url?: string;
    } | null;
}

export function PendingInvoiceModal({ isOpen, onClose, checkoutData }: PendingInvoiceModalProps) {
    const { success } = useToast();
    const [copied, setCopied] = useState(false);

    if (!checkoutData) return null;

    const handleCopy = () => {
        if (checkoutData.copyPaste) {
            navigator.clipboard.writeText(checkoutData.copyPaste);
            setCopied(true);
            success("Código PIX copiado com sucesso!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={checkoutData.type === 'PIX' ? "Pagamento via PIX" : "Finalizar Pagamento"}
        >
            <div className="space-y-6 flex flex-col items-center py-4">
                {checkoutData.type === 'PIX' ? (
                    <>
                        <div className="bg-primary/5 p-8 rounded-[2rem] border-4 border-primary/10 shadow-inner">
                            {checkoutData.qrCode ? (
                                <img
                                    src={`data:image/png;base64,${checkoutData.qrCode}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <QrCode size={48} className="text-primary/20" />
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Aguardando Pagamento...</span>
                            </div>
                            <h3 className="font-black text-gray-900 text-lg">Acesse o app do seu banco</h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                                Escaneie o QR Code acima ou copie o código abaixo para pagar.
                            </p>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                                    <div className="w-10 h-10 flex items-center justify-center text-primary">
                                        <Copy size={16} />
                                    </div>
                                </div>
                                <input
                                    readOnly
                                    value={checkoutData.copyPaste || ""}
                                    className="w-full bg-gray-50 border-gray-100 h-12 pl-12 pr-4 rounded-xl text-[10px] font-mono text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pointer-events-none"
                                />
                                <Button
                                    onClick={handleCopy}
                                    className="w-full h-12 rounded-xl font-black gap-2 mt-3 shadow-lg shadow-primary/10"
                                >
                                    {copied ? (
                                        <><CheckCircle size={18} /> Copiado!</>
                                    ) : (
                                        <><Copy size={18} /> Copiar Código PIX</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 w-full text-center">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 py-2 px-4 rounded-full inline-block">
                                Liberação imediata após o pagamento
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                                <ExternalLink size={32} className="text-primary" />
                            </div>
                            <h3 className="font-black text-gray-900 text-lg">Quase lá!</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Clique no botão abaixo para concluir seu pagamento via Cartão de Crédito no MercadoPago.
                            </p>
                            <Button
                                onClick={() => window.open(checkoutData.url, '_blank')}
                                className="w-full h-14 rounded-xl font-black gap-2 shadow-xl shadow-primary/20"
                            >
                                <ExternalLink size={18} /> Ir para Pagamento
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
