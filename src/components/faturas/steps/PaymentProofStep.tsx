"use client";

import { Button } from "@/components/ui/Button";
import { StepContainer, StepHeader } from "@/components/ui/step-modal";
import {
    UploadCloud, CheckCircle2, FileText, Loader2, XCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PaymentProofStepProps {
    step: number;
    status: string;
    isAdmin: boolean;
    comprovanteUrl?: string;
    file: File | null;
    isProcessing: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // Admin specific
    onRejeitar: (reason: string) => Promise<void>;
    isRejecting: boolean;
}

export function PaymentProofStep({
    step,
    status,
    isAdmin,
    comprovanteUrl,
    file,
    isProcessing,
    onFileChange,
    onRejeitar,
    isRejecting
}: PaymentProofStepProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const isPending = status === "pendente" || status === "atrasado";

    const handleRejeitarClick = () => {
        if (!showRejectionInput) {
            setShowRejectionInput(true);
            return;
        }
        onRejeitar(rejectionReason);
    };

    return (
        <StepContainer step={step} className="space-y-6">
            <StepHeader
                title="Comprovante de Pagamento"
                description={isPending && !isAdmin ? "Clique abaixo para anexar o recibo" : (isAdmin ? "Arquivo enviado pelo participante" : "Arquivo oficial do lote")}
            />

            {isPending && !isAdmin ? (
                <label className={cn(
                    "group relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-[40px] cursor-pointer transition-all duration-500 py-16 px-6",
                    file ? "border-green-400 bg-green-50/20 ring-4 ring-green-50" : "border-zinc-200 hover:border-blue-400 hover:bg-blue-50/50",
                    isProcessing && "opacity-50 pointer-events-none"
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
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={onFileChange} disabled={isProcessing} />
                </label>
            ) : (
                <div className="space-y-4">
                    {comprovanteUrl ? (
                        <div className="flex flex-col gap-6">
                            <div className="bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 h-48 relative group ring-1 ring-zinc-100 flex-shrink-0">
                                {comprovanteUrl.endsWith('.pdf') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-sm"><FileText size={32} /></div>
                                        <span className="font-black text-zinc-400 uppercase text-[9px] tracking-widest">Documento PDF Oficial</span>
                                        <a href={comprovanteUrl} target="_blank" className="text-blue-600 font-black text-[11px] hover:underline">VISUALIZAR ARQUIVO</a>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={comprovanteUrl}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 cursor-zoom-in"
                                            alt="Recibo"
                                            onClick={() => setIsFullscreen(true)}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
                                            <span
                                                className="bg-white text-zinc-900 px-6 py-2.5 rounded-full font-black text-xs shadow-2xl transition-transform group-hover:scale-110 pointer-events-auto cursor-pointer"
                                                onClick={() => setIsFullscreen(true)}
                                            >
                                                Inspecionar
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isFullscreen && !comprovanteUrl.endsWith('.pdf') && (
                                <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 backdrop-blur-sm" onClick={() => setIsFullscreen(false)}>
                                    <div className="absolute top-6 right-6 flex gap-3">
                                        <a href={comprovanteUrl} target="_blank" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-xs backdrop-blur-md transition-colors" onClick={(e) => e.stopPropagation()}>
                                            Nova Guia
                                        </a>
                                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-xs backdrop-blur-md transition-colors" onClick={() => setIsFullscreen(false)}>
                                            Fechar
                                        </button>
                                    </div>
                                    <img src={comprovanteUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-none" alt="Comprovante em tela cheia" />
                                </div>
                            )}

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
                                                    onClick={handleRejeitarClick}
                                                    disabled={isRejecting}
                                                >
                                                    {isRejecting ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                                                    Confirmar Rejeição
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 border-red-200 hover:bg-red-50 py-6 rounded-[24px]"
                                                onClick={handleRejeitarClick}
                                                disabled={isRejecting}
                                            >
                                                <XCircle size={16} className="mr-2" />
                                                Rejeitar Pagamento
                                            </Button>
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
}
