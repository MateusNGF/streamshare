"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
    Copy,
    UploadCloud,
    CheckCircle2,
    CheckCircle,
    Loader2,
    MessageCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Info,
    Receipt,
    Clock,
    XCircle,
    Sparkles,
    Check,
    FileText
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { generateStaticPix } from "@/lib/pix-generator";
import { useToast } from "@/hooks/useToast";
import { confirmarLotePagamento, aprovarLoteAction, rejeitarLoteAction } from "@/actions/cobrancas";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { cn } from "@/lib/utils";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import {
    StepContainer,
    StepIndicator,
    StepNavigation,
    StepHeader,
    StepIcon
} from "@/components/ui/step-modal";

interface ModalPagamentoLoteProps {
    isOpen: boolean;
    onClose: () => void;
    lote: any;
    isAdmin?: boolean;
}

export function ModalPagamentoLote({ isOpen, onClose, lote, isAdmin = false }: ModalPagamentoLoteProps) {
    const { format } = useCurrency();
    const { success, error: toastError } = useToast();

    const [step, setStep] = useState<number>(1);
    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false); // IDEMPOTENCIA VISUAL
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const valor = Number(lote?.valorTotal || 0);
    const status = lote?.status || "pendente";
    const steps = isAdmin
        ? ["Resumo", "Comprovante", "Histórico"]
        : (status === "pendente" ? ["Pagar", "Comprovante", "Sucesso"] : ["Resumo", "Status", "Comprovante"]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
            setIsSuccess(false);
        }
    }, [isOpen]);

    useEffect(() => {
        async function loadPix() {
            const chavePix = lote?.participante?.conta?.chavePix;
            const nomeConta = lote?.participante?.conta?.nome || "Titular";
            if (isOpen && chavePix && lote?.id && status === "pendente") {
                setIsLoadingPix(true);
                try {
                    const payload = await generateStaticPix(chavePix, nomeConta, "Brasil", valor, `LOTE-${lote.id}`);
                    setPixPayload(payload);
                } catch (err) {
                    console.error("Erro ao gerar PIX para lote:", err);
                } finally {
                    setIsLoadingPix(false);
                }
            }
        }
        loadPix();
    }, [isOpen, lote, status, valor]);

    if (!lote) return null;

    const copyPix = () => {
        if (!pixPayload) return;
        navigator.clipboard.writeText(pixPayload);
        success("Código Pix do Lote copiado!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        if (!pixPayload) return;
        const msgHeader = `Olá! Segue o PIX para pagamento do lote (${lote.cobrancas.length} itens):\n\n`;
        const services = lote.cobrancas.map((c: any) => `- ${c.assinatura.streaming.apelido || c.assinatura.streaming.catalogo.nome}: ${format(Number(c.valor))}`).join('\n');
        const message = `${msgHeader}${services}\n\n*Total: ${format(valor)}*\n\nPIX:\n${pixPayload}`;

        const whatsapp = lote?.participante?.whatsappNumero;

        try {
            const link = whatsapp
                ? generateWhatsAppLink(whatsapp, message)
                : generateWhatsAppLinkTextOnly(message);
            window.open(link, "_blank");
        } catch (err) {
            toastError("Erro ao gerar link do WhatsApp.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
            setFile(selectedFile);
        } else if (selectedFile) {
            toastError("Arquivo muito grande. Limite 5MB.");
        }
    };

    const handleConfirmar = async () => {
        setIsConfirming(true);
        try {
            const formData = new FormData();
            if (file) {
                formData.append("comprovante", file);
            }

            const result = await confirmarLotePagamento(lote.id, formData);
            if (result.success) {
                setIsSuccess(true);
                setStep(3);
                success("Pagamento processado com sucesso!");
            } else {
                toastError(result.error || "Erro ao processar lote.");
            }
        } catch (err) {
            toastError("Erro ao confirmar lote.");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleAprovar = async () => {
        setIsApproving(true);
        try {
            const result = await aprovarLoteAction(lote.id);
            if (result.success) {
                success("Lote aprovado com sucesso!");
                onClose();
            } else {
                toastError(result.error || "Erro ao aprovar lote.");
            }
        } catch (err) {
            toastError("Erro ao aprovar lote.");
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
            const result = await rejeitarLoteAction(lote.id, rejectionReason);
            if (result.success) {
                success("Lote rejeitado. O participante precisará re-enviar o comprovante.");
                onClose();
            } else {
                toastError(result.error || "Erro ao rejeitar lote.");
            }
        } catch (err) {
            toastError("Erro ao rejeitar lote.");
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
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Valor do Lote</span>
                        </div>
                        <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">{format(valor)}</h2>
                    </div>
                    <Badge variant={status === "pago" ? "success" : status === "aguardando_aprovacao" ? "warning" : "default"} className="font-black px-4 py-1.5 rounded-full shadow-sm">
                        {status === "pago" ? "PAGO" : status === "aguardando_aprovacao" ? "EM ANÁLISE" : "PENDENTE"}
                    </Badge>
                </div>
            </div>

            {!isAdmin && status === "pendente" && (
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-5 rounded-[32px] border border-zinc-100 shadow-sm ring-1 ring-blue-50 group">
                    <div className="bg-zinc-50 p-2.5 rounded-[28px] border border-zinc-100 transition-transform group-hover:scale-105 duration-500">
                        <div className="p-1.5 bg-white rounded-xl shadow-inner">
                            {isLoadingPix ? <div className="w-20 h-20 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-200" size={24} /></div> : pixPayload ? <QRCode value={pixPayload} size={84} /> : <div className="w-20 h-20 flex items-center justify-center bg-red-50 text-red-500 font-black text-xs">ERRO</div>}
                        </div>
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">PIX Copia e Cola</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button onClick={copyPix} variant="outline" size="sm" className="flex-1 text-[11px] h-9 gap-2 rounded-xl border-zinc-100 text-zinc-600 font-bold hover:bg-zinc-50 transition-all">
                                {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                {isCopied ? "Copiado!" : "Copiar"}
                            </Button>
                            <Button onClick={() => window.open(generateWhatsAppLink(lote.participante?.whatsappNumero || "", `PIX para pagamento do lote: ${pixPayload}`), "_blank")} variant="outline" size="sm" className="flex-1 text-[11px] h-9 gap-2 rounded-xl border-green-100 text-green-700 font-bold hover:bg-green-50 transition-all">
                                <MessageCircle size={14} /> WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm mt-4">
                <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
                    <span className="text-xs font-bold text-zinc-600">Composição do Lote</span>
                    <Badge variant="outline">{lote.cobrancas.length} itens</Badge>
                </div>
                <div className="max-h-[120px] overflow-y-auto px-4 py-1 divide-y divide-zinc-50">
                    {lote.cobrancas.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <StreamingLogo name={c.assinatura.streaming.catalogo.nome} iconeUrl={c.assinatura.streaming.catalogo.iconeUrl} color={c.assinatura.streaming.catalogo.corPrimaria} size="xs" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-zinc-800 text-xs tracking-tight">{c.assinatura.streaming.apelido || c.assinatura.streaming.catalogo.nome}</span>
                                    <span className="text-[9px] text-zinc-400 font-medium">Fatura #{c.id}</span>
                                </div>
                            </div>
                            <span className="font-black text-zinc-900 text-xs">{format(Number(c.valor))}</span>
                        </div>
                    ))}
                </div>
            </div>
        </StepContainer>
    );

    const renderStatusStep = () => (
        <StepContainer step={step} className="space-y-6">
            <StepHeader
                title="Caminho da Aprovação"
                description={`Timeline do Lote #${lote.id}`}
            />

            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-zinc-100 px-2 pb-4">
                <div className="relative pl-10">
                    <div className="absolute left-1.5 top-0 w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-100 border-4 border-white flex items-center justify-center" />
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-zinc-900 uppercase">Lote Criado</p>
                        <p className="text-xs text-zinc-500 font-medium">{new Date(lote.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="relative pl-10">
                    <div className={cn("absolute left-1.5 top-0 w-5 h-5 rounded-full shadow-lg border-4 border-white", status !== "pendente" ? "bg-green-500 shadow-green-100" : "bg-zinc-200")} />
                    <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black uppercase", status !== "pendente" ? "text-zinc-900" : "text-zinc-400")}>Comprovante Enviado</p>
                        <p className="text-xs text-zinc-500 font-medium">{status !== "pendente" ? new Date(lote.updatedAt).toLocaleString() : "Aguardando..."}</p>
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

    const renderComprovanteStep = () => (
        <StepContainer step={step} className="space-y-6">
            <StepHeader
                title="Comprovante de Pagamento"
                description={status === "pendente" && !isAdmin ? "Clique abaixo para selecionar o arquivo" : "Arquivo oficial do lote"}
            />

            {status === "pendente" && !isAdmin ? (
                <label className={cn(
                    "group relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-[40px] cursor-pointer transition-all duration-500 py-16 px-6",
                    file ? "border-green-400 bg-green-50/20 ring-4 ring-green-50" : "border-zinc-200 hover:border-blue-400 hover:bg-blue-50/50",
                    isConfirming && "opacity-50 pointer-events-none"
                )}>
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
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isConfirming} />
                </label>
            ) : (
                <div className="space-y-4">
                    {lote.comprovanteUrl ? (
                        <div className="space-y-4">
                            <div className="bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 aspect-video relative group ring-1 ring-zinc-100">
                                {lote.comprovanteUrl.endsWith('.pdf') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FileText size={32} /></div>
                                        <span className="font-black text-zinc-400 uppercase text-[9px] tracking-widest">Documento PDF Oficial</span>
                                        <a href={lote.comprovanteUrl} target="_blank" className="text-blue-600 font-black text-[11px] hover:underline">VISUALIZAR ARQUIVO</a>
                                    </div>
                                ) : (
                                    <>
                                        <img src={lote.comprovanteUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Recibo" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <a href={lote.comprovanteUrl} target="_blank" className="bg-white text-zinc-900 px-6 py-2.5 rounded-full font-black text-xs shadow-2xl transition-transform hover:scale-110">Ver em tela cheia</a>
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
                                                <Button
                                                    variant="ghost"
                                                    className="flex-1 text-zinc-500 hover:bg-zinc-100"
                                                    onClick={() => setShowRejectionInput(false)}
                                                    disabled={isRejecting}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                    onClick={handleRejeitar}
                                                    disabled={isRejecting}
                                                >
                                                    {isRejecting ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                                                    Confirmar Rejeição
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={handleRejeitar}
                                                    disabled={isRejecting || isApproving}
                                                >
                                                    <XCircle size={16} className="mr-2" />
                                                    Rejeitar
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={handleAprovar}
                                                    disabled={isApproving || isRejecting}
                                                >
                                                    {isApproving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                                                    Aprovar Pagamento
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-50 rounded-[32px] p-16 text-center border border-dashed border-zinc-200">
                            <Clock className="mx-auto text-zinc-200 mb-4" size={40} />
                            <p className="font-black text-zinc-400 text-xs uppercase tracking-widest">
                                {isAdmin ? "Usuário ainda não enviou" : "Aguardando Envio"}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </StepContainer>
    );

    const renderSuccessStep = () => (
        <StepContainer step={step} className="py-12 flex flex-col items-center text-center">
            <StepIcon icon={Sparkles} variant="success" />
            <StepHeader
                title="Processo Iniciado!"
                description={`Seu comprovante foi enviado e o lote #${lote.id} está agora em análise pela nossa equipe.`}
            />
            <div className="bg-zinc-50 px-6 py-2 rounded-full border border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Ticket Automático Gerado
            </div>
        </StepContainer>
    );

    return (
        <Modal
            isOpen={isOpen} onClose={onClose}
            title={status === "pendente" ? "Pagamento Consolidado" : `Lote #${lote.id}`}
            className="sm:max-w-[480px]"
            footer={
                <StepNavigation
                    step={step}
                    totalSteps={3}
                    onBack={isSuccess ? undefined : () => setStep(s => s - 1)}
                    onNext={() => {
                        if (isSuccess) onClose();
                        else if (status === "pendente" && step === 2) handleConfirmar();
                        else if (step < 3) setStep(s => s + 1);
                        else onClose();
                    }}
                    isLoading={isConfirming}
                    canNext={status === "pendente" && step === 2 ? !!file : true}
                    nextLabel={
                        isSuccess ? "Concluir" :
                            (status === "pendente" && step === 2 ? "Confirmar Lote" :
                                (step === 3 ? "Sair" : "Próximo"))
                    }
                    nextIcon={status === "pendente" && step === 2 ? CheckCircle : ChevronRight}
                    className="justify-end"
                />
            }
        >
            <div className="space-y-8 pt-2">
                {!isSuccess && (
                    <StepIndicator currentStep={step} totalSteps={3} />
                )}

                <div className="min-h-[340px] flex flex-col justify-center">
                    {isAdmin ? (
                        step === 1 ? renderSummary() : step === 2 ? renderComprovanteStep() : renderStatusStep()
                    ) : status === "pendente" ? (
                        step === 1 ? renderSummary() : step === 2 ? renderComprovanteStep() : renderSuccessStep()
                    ) : (
                        step === 1 ? renderSummary() : step === 2 ? renderStatusStep() : renderComprovanteStep()
                    )}
                </div>
            </div>
        </Modal>
    );
}
