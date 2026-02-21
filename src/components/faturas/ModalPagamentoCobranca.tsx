"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, UploadCloud, CheckCircle2, Loader2, MessageCircle, AlertCircle } from "lucide-react";
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

    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const valor = Number(fatura?.valor || 0);
    const chavePix = fatura?.assinatura?.participante?.conta?.chavePix;
    const nomeConta = fatura?.assinatura?.participante?.conta?.nome || "Titular";

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
            className="sm:max-w-[700px] overflow-hidden"
        >
            <div className="w-full">
                {!chavePix ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-2 mt-2">
                        <AlertCircle size={24} className="flex-shrink-0" />
                        <p className="text-sm font-medium">O dono da plataforma não configurou a chave PIX. Impossível gerar QR Code no momento.</p>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-5 items-stretch pt-2 pb-2">

                        {/* LADO ESQUERDO: PIX REFATORADO (COMPACTO) */}
                        <div className="flex-1 flex flex-col gap-4">
                            {/* Bloco de Valor Destacado */}
                            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-5 rounded-2xl border border-blue-100/60 shadow-inner flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-0.5">Total da Fatura</span>
                                <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-none">{format(valor)}</div>
                            </div>

                            {/* Bloco QR Code e Ações */}
                            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-4 h-full">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex justify-center items-center w-[150px] h-[150px] transition-transform hover:scale-[1.02]">
                                    {isLoadingPix ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Gerando</span>
                                        </div>
                                    ) : (
                                        pixPayload ? <QRCode value={pixPayload} size={130} /> : <span className="text-gray-400 text-[10px] uppercase font-bold">Erro QR</span>
                                    )}
                                </div>

                                {/* Campo Copia e Cola visível */}
                                <div className="w-full relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixPayload || "Aguardando geração..."}
                                        className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 truncate"
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                </div>

                                <div className="w-full flex gap-2">
                                    <Button
                                        onClick={copyPix}
                                        variant="secondary"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="flex-1 font-bold gap-1.5 text-primary bg-primary/10 hover:bg-primary/20 transition-all h-10 text-xs border-transparent hover:-translate-y-[1px]"
                                    >
                                        <Copy size={14} /> Copiar
                                    </Button>
                                    <Button
                                        onClick={shareWhatsApp}
                                        variant="secondary"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="flex-1 font-bold gap-1.5 text-green-700 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 transition-all h-10 text-xs hover:-translate-y-[1px]"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* SEPARADOR DIVISÓRIO */}
                        <div className="hidden sm:block w-px bg-gray-100" />

                        {/* LADO DIREITO: ENVIO DE COMPROVANTE */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full gap-5">
                                <div className="space-y-1">
                                    <h4 className="font-black text-gray-900 text-lg tracking-tight">Anexar Comprovante</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Após realizar o PIX e salvar na galeria, envie o recibo aqui para acelerar sua liberação.</p>
                                </div>

                                <label className={cn(
                                    "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all group relative overflow-hidden flex-1 min-h-[140px]",
                                    file ? "border-green-300 bg-green-50/30" : "border-gray-200 hover:bg-blue-50/40 hover:border-primary"
                                )}>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col items-center justify-center px-4 relative z-10 text-center">
                                        {file ? (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                                <p className="text-xs text-gray-700 truncate max-w-[180px] font-bold">{file.name}</p>
                                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-1 hover:underline">Trocar arquivo</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-white transition-colors shadow-sm">
                                                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    <span className="text-primary group-hover:underline">Clique para fazer upload</span>
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Somente Imagens PNG ou JPG</p>
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

                                <Button
                                    onClick={handleEnviar}
                                    disabled={!file || isUploading}
                                    className="w-full font-black text-xs uppercase tracking-wider h-11 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:shadow-none"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : "Enviar Comprovante de Pagamento"}
                                </Button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </Modal>
    );
}
