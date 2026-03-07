"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import { CheckCircle, ChevronRight, Sparkles, Check } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { confirmarPagamento, rejeitarCobrancaAction } from "@/actions/cobrancas";
import { enviarComprovanteAction } from "@/actions/comprovantes";
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

interface ModalPagamentoCobrancaProps {
    isOpen: boolean;
    onClose: () => void;
    fatura: any;
    isAdmin?: boolean;
}

export function ModalPagamentoCobranca({ isOpen, onClose, fatura, isAdmin = false }: ModalPagamentoCobrancaProps) {
    const { format } = useCurrency();
    const { success } = useToast();
    const [step, setStep] = useState<number>(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const valor = Number(fatura?.valor || 0);
    const status = fatura?.status || "pendente";
    const chavePix = fatura?.assinatura?.participante?.conta?.chavePix;
    const nomeConta = fatura?.assinatura?.participante?.conta?.nome || "Titular";

    const { pixPayload, isLoadingPix } = usePixGenerator({
        isOpen, status, chavePix, nomeConta, valor, id: fatura?.id, prefix: "COB"
    });

    const {
        file, setFile, isConfirming, isApproving, isRejecting,
        handleFileChange, handleConfirmar, handleAprovar, handleRejeitar
    } = usePaymentActions({
        id: fatura?.id,
        onClose,
        onSuccessStep: () => { setIsSuccess(true); setStep(3); },
        confirmAction: (id, fd) => (fd ? enviarComprovanteAction(id, fd) : Promise.reject("No file")),
        approveAction: confirmarPagamento,
        rejectAction: rejeitarCobrancaAction
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
            setIsSuccess(false);
        }
    }, [isOpen, setFile]);

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
        const msg = `PIX para pagamento da fatura: ${pixPayload}`;
        window.open(generateWhatsAppLink(fatura.assinatura?.participante?.whatsappNumero || "", msg), "_blank");
    };

    const renderSuccessStep = () => (
        <StepContainer step={step} className="py-12 flex flex-col items-center text-center">
            <StepIcon icon={Sparkles} variant="success" />
            <StepHeader
                title="Processo Iniciado!"
                description={`Seu comprovante foi enviado e a fatura #${fatura.id} está agora em análise pela nossa equipe.`}
            />
            <div className="bg-zinc-50 px-6 py-2 rounded-full border border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Ticket Automático Gerado
            </div>
        </StepContainer>
    );

    const isPending = status === "pendente" || status === "atrasado";

    return (
        <Modal
            isOpen={isOpen} onClose={onClose}
            title={isPending ? "Pagar Fatura" : `Fatura #${fatura.id}`}
            className="sm:max-w-[480px]"
            footer={
                <StepNavigation
                    step={step}
                    totalSteps={3}
                    onBack={isSuccess ? undefined : () => setStep(s => s - 1)}
                    onNext={() => {
                        if (isSuccess) onClose();
                        else if (isPending && !isAdmin && step === 2) handleConfirmar();
                        else if (isAdmin && status === "aguardando_aprovacao" && step === 3) handleAprovar();
                        else if (step < 3) setStep(s => s + 1);
                        else onClose();
                    }}
                    isLoading={isConfirming || isApproving}
                    canNext={isPending && !isAdmin && step === 2 ? !!file : true}
                    nextLabel={
                        isSuccess ? "Concluir" :
                            (isPending && !isAdmin && step === 2 ? "Confirmar Envio" :
                                (isAdmin && status === "aguardando_aprovacao" && step === 3 ? "Aprovar Pagamento" :
                                    (step === 3 ? "Sair" : "Próximo")))
                    }
                    nextIcon={
                        (isPending && !isAdmin && step === 2) ? CheckCircle :
                            (isAdmin && status === "aguardando_aprovacao" && step === 3) ? Check : ChevronRight
                    }
                    className="justify-end w-full"
                />
            }
        >
            <div className="space-y-8 pt-2">
                {!isSuccess && <StepIndicator currentStep={step} totalSteps={3} />}
                <div className="min-h-[340px] flex flex-col justify-center">
                    {isAdmin ? (
                        step === 1 ? (
                            <PaymentSummaryStep
                                step={1} valor={valor} id={fatura.id} status={status} isAdmin={true}
                                format={format} cobrancas={[fatura]} onCopyPix={copyPix} onShareWhatsapp={shareWhatsApp} isCopied={isCopied}
                            />
                        ) : step === 2 ? (
                            <PaymentHistoryStep step={2} id={fatura.id} status={status} createdAt={fatura.createdAt} updatedAt={fatura.updatedAt} type="fatura" />
                        ) : (
                            <PaymentProofStep
                                step={3} status={status} isAdmin={true} comprovanteUrl={fatura.comprovanteUrl} file={file} isProcessing={isApproving}
                                onFileChange={handleFileChange} onRejeitar={handleRejeitar} isRejecting={isRejecting}
                            />
                        )
                    ) : isPending ? (
                        step === 1 ? (
                            <PaymentSummaryStep
                                step={1} valor={valor} id={fatura.id} status={status} isAdmin={false} format={format} cobrancas={[fatura]}
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
                                step={1} valor={valor} id={fatura.id} status={status} isAdmin={false} format={format} cobrancas={[fatura]}
                                onCopyPix={copyPix} onShareWhatsapp={shareWhatsApp} isCopied={isCopied}
                            />
                        ) : step === 2 ? (
                            <PaymentHistoryStep step={2} id={fatura.id} status={status} createdAt={fatura.createdAt} updatedAt={fatura.updatedAt} type="fatura" />
                        ) : (
                            <PaymentProofStep
                                step={3} status={status} isAdmin={false} comprovanteUrl={fatura.comprovanteUrl} file={null} isProcessing={false}
                                onFileChange={() => { }} onRejeitar={async () => { }} isRejecting={false}
                            />
                        )
                    )}
                </div>
            </div>
        </Modal>
    );
}
