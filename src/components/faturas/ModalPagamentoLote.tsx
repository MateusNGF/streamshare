"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import { CheckCircle, ChevronRight, Sparkles, Check } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { aprovarLoteAction, rejeitarLoteAction, confirmarLotePagamento } from "@/actions/cobrancas";
import { generateWhatsAppLink } from "@/lib/whatsapp-link-utils";
import {
    StepIndicator,
    StepNavigation,
    StepIcon,
    StepHeader,
    StepContainer
} from "@/components/ui/step-modal";
import { usePixGenerator } from "@/hooks/usePixGenerator";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { PaymentSummaryStep } from "./steps/PaymentSummaryStep";
import { PaymentHistoryStep } from "./steps/PaymentHistoryStep";
import { PaymentProofStep } from "./steps/PaymentProofStep";
import { useToast } from "@/hooks/useToast";

interface ModalPagamentoLoteProps {
    isOpen: boolean;
    onClose: () => void;
    lote: any;
    isAdmin?: boolean;
}

export function ModalPagamentoLote({ isOpen, onClose, lote, isAdmin = false }: ModalPagamentoLoteProps) {
    const { format } = useCurrency();
    const { success } = useToast();
    const [step, setStep] = useState<number>(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const valor = Number(lote?.valorTotal || 0);
    const status = lote?.status || "pendente";
    const chavePix = lote?.participante?.conta?.chavePix;
    const nomeConta = lote?.participante?.conta?.nome || "Titular";

    const { pixPayload, isLoadingPix } = usePixGenerator({
        isOpen, status, chavePix, nomeConta, valor, id: lote?.id, prefix: "LOTE"
    });

    const {
        file, setFile, isConfirming, isApproving, isRejecting,
        handleFileChange, handleConfirmar, handleAprovar, handleRejeitar
    } = usePaymentActions({
        id: lote?.id,
        onClose,
        onSuccessStep: () => { setIsSuccess(true); setStep(3); },
        confirmAction: confirmarLotePagamento,
        approveAction: aprovarLoteAction,
        rejectAction: rejeitarLoteAction
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
            setIsSuccess(false);
        }
    }, [isOpen, setFile]);

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
        const msg = `PIX para pagamento do lote: ${pixPayload}`;
        window.open(generateWhatsAppLink(lote.participante?.whatsappNumero || "", msg), "_blank");
    };

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
            title={
                <div className="flex items-center gap-3">
                    <span>{status === "pendente" ? "Pagamento Consolidado" : `Lote #${lote.id}`}</span>
                    <Badge variant={status === "pago" ? "success" : status === "aguardando_aprovacao" ? "warning" : "default"} className="font-black px-3 py-1 text-[10px] rounded-full shadow-sm">
                        {status === "pago" ? "PAGO" : status === "aguardando_aprovacao" ? "EM ANÁLISE" : "PENDENTE"}
                    </Badge>
                </div>
            }
            className="sm:max-w-[480px]"
            footer={
                <StepNavigation
                    step={step}
                    totalSteps={3}
                    onBack={isSuccess ? undefined : () => setStep(s => s - 1)}
                    onNext={() => {
                        if (isSuccess) onClose();
                        else if (status === "pendente" && step === 2) handleConfirmar();
                        else if (isAdmin && status === "aguardando_aprovacao" && step === 3) handleAprovar();
                        else if (step < 3) setStep(s => s + 1);
                        else onClose();
                    }}
                    isLoading={isConfirming || isApproving}
                    canNext={status === "pendente" && step === 2 ? !!file : true}
                    nextLabel={
                        isSuccess ? "Concluir" :
                            (status === "pendente" && step === 2 ? "Confirmar Lote" :
                                (isAdmin && status === "aguardando_aprovacao" && step === 3 ? "Aprovar Pagamento" :
                                    (step === 3 ? "Sair" : "Próximo")))
                    }
                    nextIcon={
                        (status === "pendente" && step === 2) ? CheckCircle :
                            (isAdmin && status === "aguardando_aprovacao" && step === 3) ? Check : ChevronRight
                    }
                    className="justify-end"
                />
            }
        >
            <div className="space-y-8 pt-2">
                {!isSuccess && <StepIndicator currentStep={step} totalSteps={3} />}
                <div className="min-h-[340px] flex flex-col justify-center">
                    {isAdmin ? (
                        step === 1 ? (
                            <PaymentSummaryStep
                                step={1} valor={valor} id={lote.id} status={status} isAdmin={true}
                                format={format} cobrancas={lote.cobrancas} onCopyPix={copyPix} onShareWhatsapp={shareWhatsApp} isCopied={isCopied}
                            />
                        ) : step === 2 ? (
                            <PaymentHistoryStep step={2} id={lote.id} status={status} createdAt={lote.createdAt} updatedAt={lote.updatedAt} type="lote" />
                        ) : (
                            <PaymentProofStep
                                step={3} status={status} isAdmin={true} comprovanteUrl={lote.comprovanteUrl} file={file} isProcessing={isApproving}
                                onFileChange={handleFileChange} onRejeitar={handleRejeitar} isRejecting={isRejecting}
                            />
                        )
                    ) : status === "pendente" ? (
                        step === 1 ? (
                            <PaymentSummaryStep
                                step={1} valor={valor} id={lote.id} status={status} isAdmin={false} format={format} cobrancas={lote.cobrancas}
                                onCopyPix={copyPix} onShareWhatsapp={shareWhatsApp} isCopied={isCopied} pixData={{ payload: pixPayload, isLoading: isLoadingPix, chavePix }}
                            />
                        ) : step === 2 ? (
                            <PaymentProofStep
                                step={2} status={status} isAdmin={false} file={file} isProcessing={isConfirming}
                                onFileChange={handleFileChange} onRejeitar={handleRejeitar} isRejecting={false}
                            />
                        ) : renderSuccessStep()
                    ) : (
                        step === 1 ? (
                            <PaymentSummaryStep
                                step={1} valor={valor} id={lote.id} status={status} isAdmin={false} format={format} cobrancas={lote.cobrancas}
                                onCopyPix={copyPix} onShareWhatsapp={shareWhatsApp} isCopied={isCopied}
                            />
                        ) : step === 2 ? (
                            <PaymentHistoryStep step={2} id={lote.id} status={status} createdAt={lote.createdAt} updatedAt={lote.updatedAt} type="lote" />
                        ) : (
                            <PaymentProofStep
                                step={3} status={status} isAdmin={false} comprovanteUrl={lote.comprovanteUrl} file={null} isProcessing={false}
                                onFileChange={() => { }} onRejeitar={async () => { }} isRejecting={false}
                            />
                        )
                    )}
                </div>
            </div>
        </Modal>
    );
}
