"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, UploadCloud, CheckCircle2, CheckCircle, Loader2, MessageCircle, AlertCircle, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { generateStaticPix } from "@/lib/pix-generator";
import { useToast } from "@/hooks/useToast";
import { enviarComprovanteAction } from "@/actions/comprovantes";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { cn } from "@/lib/utils";

interface ModalPagamentoCobrancaProps {
    isOpen: boolean;
    onClose: () => void;
    fatura: any;
}

export function ModalPagamentoCobranca({ isOpen, onClose, fatura }: ModalPagamentoCobrancaProps) {
    const { format } = useCurrency();
    const { success, error: toastError } = useToast();

    const [step, setStep] = useState<1 | 2>(1);
    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const valor = Number(fatura?.valor || 0);
    const chavePix = fatura?.assinatura?.participante?.conta?.chavePix;
    const nomeConta = fatura?.assinatura?.participante?.conta?.nome || "Titular";

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
        }
    }, [isOpen]);

    useEffect(() => {
        async function loadPix() {
            if (isOpen && chavePix) {
                setIsLoadingPix(true);
                try {
                    const payload = await generateStaticPix(chavePix, nomeConta, "Brasil", valor, fatura.id?.toString());
                    setPixPayload(payload);
                } catch (err) {
                    console.error("Erro ao gerar PIX:", err);
                } finally {
                    setIsLoadingPix(false);
                }
            }
        }
        loadPix();
    }, [isOpen, chavePix, nomeConta, valor, fatura?.id]);

    if (!fatura) return null;

    const copyPix = () => {
        if (!pixPayload) return;
        navigator.clipboard.writeText(pixPayload);
        success("Código Pix Copia e Cola transferido!");
    };

    const shareWhatsApp = () => {
        if (!pixPayload) return;
        const message = `Olá! Segue o PIX para pagamento da fatura do streaming ${fatura?.assinatura?.streaming?.apelido || fatura?.assinatura?.streaming?.catalogo?.nome || ""}:\n\n${pixPayload}\n\nValor: ${format(valor)}`;
        const whatsapp = fatura?.assinatura?.participante?.whatsappNumero;

        try {
            const link = whatsapp
                ? generateWhatsAppLink(whatsapp, message)
                : generateWhatsAppLinkTextOnly(message);
            window.open(link, "_blank");
        } catch (err) {
            toastError("Erro ao gerar link do WhatsApp. Verifique se o número é válido.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleEnviar = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("comprovante", file);

        const result = await enviarComprovanteAction(fatura.id, formData);
        setIsUploading(false);

        if (result.sucesso) {
            success("Comprovante enviado! Aguardando aprovação.");
            onClose();
        } else {
            toastError(result.erro || "Erro ao enviar comprovante.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pagamento e Liberação"
            className="sm:max-w-[500px] overflow-hidden"
            footer={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:justify-end">
                    {step === 1 ? (
                        <>
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold"
                            >
                                Enviar Comprovante <ChevronRight size={16} />
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-row items-center gap-2 w-full sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="w-auto px-3 font-bold"
                                disabled={isUploading}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                onClick={handleEnviar}
                                className="flex-1 sm:flex-none sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 font-bold whitespace-nowrap"
                                disabled={!file || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Confirmando ...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} /> Confirmar Pagamento
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            }
        >
            <div className="space-y-6 py-2">
                {chavePix && (
                    /* Stepper Indicator */
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black transition-all",
                            step === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-green-100 text-green-600 border border-green-200"
                        )}>
                            {step > 1 ? <CheckCircle2 size={14} /> : "1"}
                        </div>
                        <div className={cn("h-0.5 w-10 rounded-full transition-all", step > 1 ? "bg-green-500" : "bg-gray-100")} />
                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black transition-all",
                            step === 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"
                        )}>
                            2
                        </div>
                    </div>
                )}

                {!chavePix ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-gray-900 text-lg">Indisponível</h3>
                            <p className="text-sm text-gray-500 max-w-[300px]">O dono da plataforma não configurou a chave PIX. Impossível realizar o pagamento agora.</p>
                        </div>
                    </div>
                ) : step === 1 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center">
                            <h3 className="font-black text-gray-900 text-base tracking-tight leading-tight">Pagamento via PIX</h3>
                            <p className="text-[11px] text-gray-400 font-medium">Escaneie o QR ou copie a chave</p>
                        </div>

                        <div className="flex flex-row items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 shadow-sm">
                            {/* Lado Esquerdo: QR Code */}
                            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex justify-center items-center w-[120px] h-[120px] shrink-0 transition-transform hover:scale-[1.02]">
                                {isLoadingPix ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Gerando</span>
                                    </div>
                                ) : (
                                    pixPayload ? <QRCode value={pixPayload} size={108} /> : <span className="text-gray-400 text-[9px] uppercase font-bold">Erro QR</span>
                                )}
                            </div>

                            {/* Lado Direito: Valor e Título */}
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-col justify-center">
                                    <span className="text-[8px] font-black  text-blue-400 uppercase mb-0.5">Montante Total</span>
                                    <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{format(valor)}</div>
                                </div>
                                <div className="px-1">
                                    <p className="text-[10px] text-gray-400 leading-snug font-medium italic">
                                        Liberação rápida após o envio do comprovante.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bloco Ações em Baixo */}
                        <div className="space-y-3">
                            {/* Campo Copia e Cola */}
                            <input
                                type="text"
                                readOnly
                                value={pixPayload || "Aguardando geração..."}
                                className="w-full text-[10px] font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 truncate"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />

                            <div className="w-full flex gap-2">
                                <Button
                                    onClick={copyPix}
                                    variant="secondary"
                                    disabled={!pixPayload || isLoadingPix}
                                    className="flex-1 font-bold gap-2 text-primary bg-primary/10 hover:bg-primary/20 transition-all h-10 text-xs"
                                >
                                    <Copy size={13} /> Copiar Código
                                </Button>
                                <Button
                                    onClick={shareWhatsApp}
                                    variant="secondary"
                                    disabled={!pixPayload || isLoadingPix}
                                    className="flex-1 font-bold gap-2 text-green-700 bg-green-50 hover:bg-green-100 border-green-200 h-10 text-xs"
                                >
                                    <MessageCircle size={13} /> WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center">
                            <h3 className="font-black text-gray-900 text-base tracking-tight leading-tight">Anexar Comprovante</h3>
                            <p className="text-[11px] text-gray-400 font-medium">Envie o recibo para agilizar sua liberação</p>
                        </div>

                        <label className={cn(
                            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all group relative overflow-hidden py-6",
                            file ? "border-green-300 bg-green-50/40" : "border-gray-200 hover:bg-blue-50/40 hover:border-blue-400"
                        )}>
                            <div className="flex flex-col items-center justify-center px-4 relative z-10 text-center">
                                {file ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-110">
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-xs text-gray-800 truncate max-w-[250px] font-black">{file.name}</p>
                                        <p className="text-[9px] text-green-600 font-black uppercase tracking-widest mt-1 hover:underline">Trocar arquivo</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-white transition-all shadow-sm border border-transparent">
                                            <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700">
                                            <span className="text-blue-600 group-hover:underline">Fazer upload do recibo</span>
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-medium mt-0.5 italic">Somente Imagens PNG ou JPG</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>

                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex gap-2.5">
                            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black text-blue-900">Processamento Manual</p>
                                <p className="text-[10px] text-blue-700 leading-snug">
                                    Seu comprovante será analisado pelo administrador para validação do acesso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
