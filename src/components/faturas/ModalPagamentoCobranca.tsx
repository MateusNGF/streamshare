"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, UploadCloud, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { generateStaticPix } from "@/lib/pix-generator";
import { useToast } from "@/hooks/useToast";
import { enviarComprovanteAction } from "@/actions/comprovantes";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";

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

    // Gera o payload do PIX de forma assíncrona (Necessário pela lib faz-um-pix)
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
        <Modal isOpen={isOpen} onClose={onClose} title="Pagamento via Pix">
            <div className="flex flex-col gap-6 items-center w-full px-2">
                {!chavePix ? (
                    <NoPixKeyAlert />
                ) : (
                    <>
                        <PixAmountDisplay valor={valor} format={format} />

                        <PixQRSection
                            payload={pixPayload}
                            loading={isLoadingPix}
                            onCopy={copyPix}
                            onShareWhatsApp={shareWhatsApp}
                        />

                        <div className="w-full border-t border-gray-100 my-2" />

                        <ProofUploadSection
                            file={file}
                            onFileChange={handleFileChange}
                            onUpload={handleEnviar}
                            loading={isUploading}
                        />
                    </>
                )}
            </div>
        </Modal>
    );
}

/**
 * Sub-componentes para manter o Single Responsibility Principle (SRP)
 */

function NoPixKeyAlert() {
    return (
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
            O dono do grupo não cadastrou uma chave PIX para recebimento. Entre em contato com ele.
        </div>
    );
}

function PixAmountDisplay({ valor, format }: { valor: number, format: any }) {
    return (
        <div className="text-center space-y-1">
            <span className="text-sm text-gray-500">Valor a Pagar:</span>
            <div className="text-3xl font-black text-gray-900">{format(valor)}</div>
        </div>
    );
}

function PixQRSection({ payload, loading, onCopy, onShareWhatsApp }: { payload: string, loading: boolean, onCopy: () => void, onShareWhatsApp: () => void }) {
    return (
        <div className="w-full space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-center min-h-[182px] items-center">
                {loading ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : (
                    payload ? <QRCode value={payload} size={150} /> : <span className="text-gray-400">Erro ao carregar QR</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                    onClick={onCopy}
                    variant="secondary"
                    disabled={!payload || loading}
                    className="font-bold gap-2 text-primary bg-primary/10 hover:bg-primary/20"
                >
                    <Copy size={16} />
                    Copiar
                </Button>

                <Button
                    onClick={onShareWhatsApp}
                    variant="secondary"
                    disabled={!payload || loading}
                    className="font-bold gap-2 text-green-600 bg-green-50 hover:bg-green-100 border-green-100"
                >
                    <MessageCircle size={16} />
                    WhatsApp
                </Button>
            </div>
        </div>
    );
}

function ProofUploadSection({ file, onFileChange, onUpload, loading }: { file: File | null, onFileChange: any, onUpload: any, loading: boolean }) {
    return (
        <div className="w-full space-y-4">
            <div className="space-y-1">
                <h4 className="font-bold text-gray-900">Já efetuou o pagamento?</h4>
                <p className="text-sm text-gray-500">Submeta o comprovante para acelerar a validação.</p>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-primary transition-all group">
                <div className="flex flex-col items-center justify-center px-4">
                    {file ? (
                        <>
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-xs text-gray-500 truncate max-w-[200px] font-medium">{file.name}</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                            <p className="text-xs text-gray-500"><span className="font-bold text-primary">Anexar</span> ou arrastar arquivo</p>
                            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF (Máx. 5MB)</p>
                        </>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={onFileChange} />
            </label>

            <Button
                onClick={onUpload}
                disabled={!file || loading}
                className="w-full gap-2 font-bold bg-primary text-white shadow-lg shadow-primary/20"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Comprovante"}
            </Button>
        </div>
    );
}

