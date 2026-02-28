"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
    Copy, UploadCloud, CheckCircle2, CheckCircle, Loader2, MessageCircle, AlertCircle, ChevronRight, ChevronLeft, Info, Receipt, Clock, XCircle, Sparkles, Check, FileText
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { generateStaticPix } from "@/lib/pix-generator";
import { useToast } from "@/hooks/useToast";
import { enviarComprovanteAction } from "@/actions/comprovantes";
import { confirmarPagamento, rejeitarCobrancaAction } from "@/actions/cobrancas";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { cn } from "@/lib/utils";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StepContainer, StepIndicator, StepNavigation, StepHeader, StepIcon } from "@/components/ui/step-modal";

interface ModalPagamentoCobrancaProps {
    isOpen: boolean;
    onClose: () => void;
    fatura: any;
    isAdmin?: boolean;
}

export function ModalPagamentoCobranca({ isOpen, onClose, fatura, isAdmin = false }: ModalPagamentoCobrancaProps) {
    const { format } = useCurrency();
    const { success, error: toastError } = useToast();

    const [step, setStep] = useState<number>(1);
    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Admin specific state
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const valor = Number(fatura?.valor || 0);
    const status = fatura?.status || "pendente";

    const chavePix = fatura?.assinatura?.participante?.conta?.chavePix;
    const nomeConta = fatura?.assinatura?.participante?.conta?.nome || "Titular";

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
            setIsSuccess(false);
            setShowRejectionInput(false);
            setRejectionReason("");
        }
    }, [isOpen]);

    useEffect(() => {
        async function loadPix() {
            if (isOpen && chavePix && fatura?.id && (status === "pendente" || status === "atrasado")) {
                setIsLoadingPix(true);
                try {
                    const payload = await generateStaticPix(chavePix, nomeConta, "Brasil", valor, fatura.id.toString());
                    setPixPayload(payload);
                } catch (err) {
                    console.error("Erro ao gerar PIX:", err);
                } finally {
                    setIsLoadingPix(false);
                }
            }
        }
        loadPix();
    }, [isOpen, chavePix, nomeConta, valor, fatura?.id, status]);

    if (!fatura) return null;

    const copyPix = () => {
        if (!pixPayload) return;
        navigator.clipboard.writeText(pixPayload);
        success("Código Pix transferido!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        if (!pixPayload) return;
        const message = `Olá! Segue o PIX para pagamento da fatura do streaming ${fatura?.assinatura?.streaming?.apelido || fatura?.assinatura?.streaming?.catalogo?.nome || ""}:\n\n*Valor: ${format(valor)}*\n\nPIX:\n${pixPayload}`;
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
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024 && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setFile(selectedFile);
        } else if (selectedFile) {
            toastError("Arquivo inválido ou muito grande. Limite 5MB (PNG, JPG, PDF).");
        }
        e.target.value = '';
    };

    const handleEnviarComprovante = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("comprovante", file);

            const result = await enviarComprovanteAction(fatura.id, formData);
            if (result.sucesso) {
                setIsSuccess(true);
                setStep(3);
                success("Comprovante enviado! Aguardando aprovação.");
            } else {
                toastError(result.erro || "Erro ao enviar comprovante.");
            }
        } catch (err) {
            toastError("Erro ao enviar comprovante.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAprovar = async () => {
        setIsApproving(true);
        try {
            const result = await confirmarPagamento(fatura.id);
            if (result.success) {
                success("Pagamento aprovado com sucesso!");
                onClose();
            } else {
                toastError(result.error || "Erro ao aprovar pagamento.");
            }
        } catch (err) {
            toastError("Erro ao aprovar pagamento.");
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejeitar = async () => {
        if (!showRejectionInput) {
            setShowRejectionInput(true);
            return;
        }
        setIsRejecting(true);
        try {
            const result = await rejeitarCobrancaAction(fatura.id, rejectionReason);
            if (result.success) {
                success("Comprovante rejeitado. O participante precisará re-enviar.");
                onClose();
            } else {
                toastError(result.error || "Erro ao rejeitar comprovante.");
            }
        } catch (err) {
            toastError("Erro ao rejeitar comprovante.");
        } finally {
            setIsRejecting(false);
        }
    };

    const renderSummary = () => (
        <StepContainer step={step} className="space-y-4">
            <div className="bg-zinc-50 rounded-[32px] border border-zinc-100 p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-primary opacity-60" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Valor da Fatura</span>
                        </div>
                        <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">{format(valor)}</h2>
                    </div>
                    <Badge variant={status === "pago" ? "success" : status === "aguardando_aprovacao" ? "warning" : "default"} className="font-black px-4 py-1.5 rounded-full shadow-sm">
                        {status === "pago" ? "PAGO" : status === "aguardando_aprovacao" ? "EM ANÁLISE" : "PENDENTE"}
                    </Badge>
                </div>
            </div>

            {!isAdmin && (status === "pendente" || status === "atrasado") && (
                !chavePix ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center bg-zinc-50 rounded-[32px] border border-zinc-100">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-zinc-900 text-lg">Pagamento Indisponível</h3>
                            <p className="text-sm text-zinc-500 max-w-[300px]">O administrador ainda não configurou a chave PIX para recebimento.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-5 rounded-[32px] border border-zinc-100 shadow-sm ring-1 ring-blue-50 group">
                        <div className="bg-zinc-50 p-2.5 rounded-[28px] border border-zinc-100 transition-transform group-hover:scale-105 duration-500">
                            <div className="p-1.5 bg-white rounded-xl shadow-inner">
                                {isLoadingPix ? <div className="w-20 h-20 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-200" size={24} /></div> : pixPayload ? <QRCode value={pixPayload} size={84} /> : <div className="w-20 h-20 flex items-center justify-center bg-red-50 text-red-500 font-black text-xs">ERRO</div>}
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">PIX Copia e Cola</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={copyPix} variant="outline" size="sm" className={cn("flex-1 text-[11px] h-9 gap-2 rounded-xl transition-all font-bold", isCopied ? "border-green-200 bg-green-50 text-green-700" : "border-zinc-100 text-zinc-600 hover:bg-zinc-50")}>
                                    {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {isCopied ? "Copiado!" : "Copiar"}
                                </Button>
                                <Button onClick={shareWhatsApp} variant="outline" size="sm" className="flex-1 text-[11px] h-9 gap-2 rounded-xl border-green-100 text-green-700 font-bold hover:bg-green-50 transition-all">
                                    <MessageCircle size={14} /> WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            )}

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm mt-4">
                <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
                    <span className="text-xs font-bold text-zinc-600">Serviço Vinculado</span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {fatura.assinatura?.streaming?.catalogo?.iconeUrl && (
                            <StreamingLogo name={fatura.assinatura.streaming.catalogo.nome} iconeUrl={fatura.assinatura.streaming.catalogo.iconeUrl} color={fatura.assinatura.streaming.catalogo.corPrimaria} size="sm" />
                        )}
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-800 text-sm tracking-tight">{fatura.assinatura?.streaming?.apelido || fatura.assinatura?.streaming?.catalogo?.nome}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Fatura #{fatura.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </StepContainer>
    );

    const renderComprovanteStep = () => (
        <StepContainer step={step} className="space-y-6">
            <StepHeader title="Comprovante de Pagamento" description={(status === "pendente" || status === "atrasado") && !isAdmin ? "Clique abaixo para anexar o recibo" : "Arquivo enviado pelo participante"} />

            {(status === "pendente" || status === "atrasado") && !isAdmin ? (
                <label className={cn("group relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-[40px] cursor-pointer transition-all duration-500 py-16 px-6", file ? "border-green-400 bg-green-50/20 ring-4 ring-green-50" : "border-zinc-200 hover:border-blue-400 hover:bg-blue-50/50", isUploading && "opacity-50 pointer-events-none")}>
                    {file ? (
                        <div className="flex flex-col items-center animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4 shadow-inner"><CheckCircle2 size={32} /></div>
                            <p className="text-sm font-black text-zinc-900 truncate max-w-[240px]">{file.name}</p>
                            <span className="text-[10px] font-black text-green-600 mt-2 bg-green-100 px-4 py-1 rounded-full">PRONTO PARA ENVIAR</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-4 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors duration-500 shadow-inner"><UploadCloud size={32} /></div>
                            <p className="text-sm font-black text-zinc-600">Fazer upload do recibo</p>
                            <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-tighter">PNG, JPG ou PDF até 5MB</p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading} />
                </label>
            ) : (
                <div className="space-y-4">
                    {fatura.comprovanteUrl ? (
                        <div className="space-y-4">
                            <div className="bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 aspect-video relative group ring-1 ring-zinc-100">
                                {fatura.comprovanteUrl.endsWith('.pdf') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FileText size={32} /></div>
                                        <span className="font-black text-zinc-400 uppercase text-[9px] tracking-widest">Documento PDF Oficial</span>
                                        <a href={fatura.comprovanteUrl} target="_blank" className="text-blue-600 font-black text-[11px] hover:underline">VISUALIZAR ARQUIVO</a>
                                    </div>
                                ) : (
                                    <>
                                        <img src={fatura.comprovanteUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Recibo" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <a href={fatura.comprovanteUrl} target="_blank" className="bg-white text-zinc-900 px-6 py-2.5 rounded-full font-black text-xs shadow-2xl transition-transform hover:scale-110">Ver em tela cheia</a>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isAdmin && status === "aguardando_aprovacao" && (
                                <div className="space-y-3">
                                    {showRejectionInput && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Motivo da Rejeição</label>
                                            <textarea
                                                className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-red-100 focus:border-red-200 outline-none transition-all resize-none"
                                                placeholder="Ex: Comprovante ilegível ou valor divergente..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        {showRejectionInput ? (
                                            <>
                                                <Button variant="ghost" className="flex-1 text-zinc-500 hover:bg-zinc-100" onClick={() => setShowRejectionInput(false)} disabled={isRejecting}>Cancelar</Button>
                                                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleRejeitar} disabled={isRejecting}>{isRejecting ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}Confirmar Rejeição</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={handleRejeitar} disabled={isRejecting || isApproving}><XCircle size={16} className="mr-2" />Rejeitar</Button>
                                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleAprovar} disabled={isApproving || isRejecting}>{isApproving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}Aprovar Pagamento</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-50 rounded-[32px] p-16 text-center border border-dashed border-zinc-200">
                            <Clock className="mx-auto text-zinc-200 mb-4" size={40} />
                            <p className="font-black text-zinc-400 text-xs uppercase tracking-widest">{isAdmin ? "Usuário ainda não enviou" : "Aguardando Envio"}</p>
                        </div>
                    )}
                </div>
            )}
        </StepContainer>
    );

    const renderStatusStep = () => (
        <StepContainer step={step} className="space-y-6">
            <StepHeader title="Caminho da Aprovação" description={`Timeline da Fatura #${fatura.id}`} />
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-zinc-100 px-2 pb-4">
                <div className="relative pl-10">
                    <div className="absolute left-1.5 top-0 w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-100 border-4 border-white" />
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-zinc-900 uppercase">Fatura Emitida</p>
                        <p className="text-xs text-zinc-500 font-medium">{new Date(fatura.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="relative pl-10">
                    <div className={cn("absolute left-1.5 top-0 w-5 h-5 rounded-full shadow-lg border-4 border-white", status !== "pendente" && status !== "atrasado" ? "bg-green-500 shadow-green-100" : "bg-zinc-200")} />
                    <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black uppercase", status !== "pendente" && status !== "atrasado" ? "text-zinc-900" : "text-zinc-400")}>Comprovante Enviado</p>
                        <p className="text-xs text-zinc-500 font-medium">{status !== "pendente" && status !== "atrasado" && fatura.updatedAt ? new Date(fatura.updatedAt).toLocaleString() : "Aguardando..."}</p>
                    </div>
                </div>
                <div className="relative pl-10">
                    <div className={cn("absolute left-1.5 top-0 w-5 h-5 rounded-full shadow-lg border-4 border-white", status === "pago" ? "bg-green-500 shadow-green-100" : "bg-zinc-200")} />
                    <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black uppercase", status === "pago" ? "text-zinc-900" : "text-zinc-400")}>Pagamento Aprovado</p>
                        <p className="text-xs text-zinc-500 font-medium">{status === "pago" ? "Liquidação confirmada pelo admin" : "Pendente"}</p>
                    </div>
                </div>
            </div>
        </StepContainer>
    );

    const renderSuccessStep = () => (
        <StepContainer step={step} className="py-12 flex flex-col items-center text-center">
            <StepIcon icon={Sparkles} variant="success" />
            <StepHeader title="Processo Iniciado!" description={`Seu comprovante foi enviado e a fatura #${fatura.id} está agora em análise pela nossa equipe.`} />
            <div className="bg-zinc-50 px-6 py-2 rounded-full border border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Ticket Automático Gerado
            </div>
        </StepContainer>
    );

    return (
        <Modal
            isOpen={isOpen} onClose={onClose}
            title={status === "pendente" || status === "atrasado" ? "Pagar Fatura" : `Fatura #${fatura.id}`}
            className="sm:max-w-[480px]"
            footer={
                <StepNavigation
                    step={step}
                    totalSteps={isAdmin ? 3 : ((status === "pendente" || status === "atrasado") ? 3 : 3)}
                    onBack={isSuccess ? undefined : () => setStep(s => s - 1)}
                    onNext={() => {
                        if (isSuccess) onClose();
                        else if ((status === "pendente" || status === "atrasado") && !isAdmin && step === 2) handleEnviarComprovante();
                        else if (step < 3) setStep(s => s + 1);
                        else onClose();
                    }}
                    isLoading={isUploading}
                    canNext={(status === "pendente" || status === "atrasado") && !isAdmin && step === 2 ? !!file : true}
                    nextLabel={
                        isSuccess ? "Concluir" :
                            ((status === "pendente" || status === "atrasado") && !isAdmin && step === 2 ? "Confirmar Envio" :
                                (step === 3 ? "Sair" : "Próximo"))
                    }
                    nextIcon={(status === "pendente" || status === "atrasado") && !isAdmin && step === 2 ? CheckCircle : ChevronRight}
                    className="justify-end w-full"
                />
            }
        >
            <div className="space-y-8 pt-2">
                {!isSuccess && <StepIndicator currentStep={step} totalSteps={3} />}
                <div className="min-h-[340px] flex flex-col justify-center">
                    {isAdmin ? (
                        step === 1 ? renderSummary() : step === 2 ? renderComprovanteStep() : renderStatusStep()
                    ) : (status === "pendente" || status === "atrasado") ? (
                        step === 1 ? renderSummary() : step === 2 ? renderComprovanteStep() : renderSuccessStep()
                    ) : (
                        step === 1 ? renderSummary() : step === 2 ? renderStatusStep() : renderComprovanteStep()
                    )}
                </div>
            </div>
        </Modal>
    );
}
