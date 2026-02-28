"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, UploadCloud, CheckCircle2, CheckCircle, Loader2, MessageCircle, AlertCircle, ChevronRight, ChevronLeft, Info, Check } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { generateStaticPix } from "@/lib/pix-generator";
import { useToast } from "@/hooks/useToast";
import { enviarComprovanteAction } from "@/actions/comprovantes";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { cn } from "@/lib/utils";
import { StepContainer, StepIndicator, StepNavigation, StepHeader } from "@/components/ui/step-modal";

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
    const [isCopied, setIsCopied] = useState(false);

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
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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
            title="Pagar Fatura"
            className="sm:max-w-[480px]"
            footer={
                <StepNavigation
                    step={step}
                    totalSteps={2}
                    onBack={step === 2 && !chavePix ? undefined : step === 2 ? () => setStep(1) : undefined}
                    onNext={() => {
                        if (step === 1) setStep(2);
                        else handleEnviar();
                    }}
                    isLoading={isUploading}
                    canNext={step === 1 ? true : !!file}
                    nextLabel={step === 1 ? "Já paguei, anexar comprovante" : "Confirmar Envio"}
                    nextIcon={step === 1 ? ChevronRight : CheckCircle}
                    className="justify-end w-full"
                />
            }
        >
            <div className="space-y-8 pt-2">
                {chavePix && (
                    <StepIndicator currentStep={step} totalSteps={2} />
                )}

                <div className="min-h-[300px] flex flex-col justify-center">
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
                        <StepContainer step={step} className="space-y-4">
                            <StepHeader
                                title="Pagamento via PIX"
                                description="Escaneie o QR ou copie a chave"
                            />

                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 shadow-sm ring-1 ring-blue-50 relative overflow-hidden">
                                {/* Lado Esquerdo: QR Code */}
                                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex justify-center items-center w-[130px] h-[130px] shrink-0 transition-transform hover:scale-[1.02] z-10">
                                    {isLoadingPix ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Gerando</span>
                                        </div>
                                    ) : (
                                        pixPayload ? <QRCode value={pixPayload} size={110} /> : <span className="text-gray-400 text-[10px] uppercase font-bold">Erro QR</span>
                                    )}
                                </div>

                                {/* Lado Direito: Valor e Título */}
                                <div className="flex-1 space-y-3 w-full text-center sm:text-left z-10">
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-black  text-blue-500 uppercase mb-1 tracking-widest">Montante Total</span>
                                        <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{format(valor)}</div>
                                    </div>
                                    <div className="px-1 hidden sm:block">
                                        <p className="text-[10px] text-gray-400 leading-snug font-medium italic">
                                            Liberação rápida após o envio do comprovante.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco Ações em Baixo */}
                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">PIX Copia e Cola</p>
                                <div className="w-full flex gap-2">
                                    <Button
                                        onClick={copyPix}
                                        variant="outline"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="flex-1 text-[11px] h-10 gap-2 rounded-xl border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition-all font-mono"
                                    >
                                        {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        {isCopied ? "Copiado!" : "Copiar"}
                                    </Button>
                                    <Button
                                        onClick={shareWhatsApp}
                                        variant="outline"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="flex-1 text-[11px] h-10 gap-2 rounded-xl border-green-200 text-green-700 font-bold hover:bg-green-50 transition-all"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </StepContainer>
                    ) : (
                        <StepContainer step={step} className="space-y-4">
                            <StepHeader
                                title="Anexar Comprovante"
                                description="Envie o recibo para agilizar sua liberação"
                            />

                            <label className={cn(
                                "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-3xl cursor-pointer transition-all group relative overflow-hidden py-10 px-6",
                                file ? "border-green-300 bg-green-50/40 ring-4 ring-green-50" : "border-gray-200 hover:bg-blue-50/40 hover:border-blue-400",
                                isUploading && "opacity-50 pointer-events-none"
                            )}>
                                <div className="flex flex-col items-center justify-center relative z-10 text-center">
                                    {file ? (
                                        <div className="flex flex-col items-center animate-in zoom-in-95">
                                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3 shadow-inner text-green-600 transition-transform group-hover:scale-110">
                                                <CheckCircle2 size={28} />
                                            </div>
                                            <p className="text-sm text-gray-900 truncate max-w-[250px] font-black">{file.name}</p>
                                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-2 hover:underline">Trocar arquivo</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-inner text-gray-300">
                                                <UploadCloud size={28} />
                                            </div>
                                            <p className="text-sm font-black text-gray-700">
                                                <span className="text-blue-600 group-hover:underline">Fazer upload do recibo</span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">Somente Imagens PNG ou JPG</p>
                                        </div>
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

                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 mt-4">
                                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-blue-900">Processamento Manual</p>
                                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                        Seu comprovante será analisado pelo administrador para validação do acesso.
                                    </p>
                                </div>
                            </div>
                        </StepContainer>
                    )}
                </div>
            </div>
        </Modal>
    );
}
