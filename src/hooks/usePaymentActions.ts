"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

interface UsePaymentActionsProps {
    id: string | number;
    onClose: () => void;
    onSuccessStep?: () => void;
    confirmAction: (id: any, formData?: FormData) => Promise<any>;
    approveAction?: (id: any) => Promise<any>;
    rejectAction?: (id: any, reason: string) => Promise<any>;
}

export function usePaymentActions({
    id,
    onClose,
    onSuccessStep,
    confirmAction,
    approveAction,
    rejectAction
}: UsePaymentActionsProps) {
    const { success, error: toastError } = useToast();

    const [isConfirming, setIsConfirming] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024 && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setFile(selectedFile);
        } else if (selectedFile) {
            toastError("Arquivo inválido ou muito grande. Limite 5MB (PNG, JPG, PDF).");
        }
        e.target.value = '';
    };

    const handleConfirmar = async () => {
        setIsConfirming(true);
        try {
            const formData = new FormData();
            if (file) {
                formData.append("comprovante", file);
            }

            const result = await confirmAction(id, formData);
            if (result.success || result.sucesso) {
                if (onSuccessStep) onSuccessStep();
                success("Pagamento processado com sucesso!");
            } else {
                toastError(result.error || result.erro || "Erro ao processar.");
            }
        } catch (err) {
            toastError("Erro ao confirmar.");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleAprovar = async () => {
        if (!approveAction) return;
        setIsApproving(true);
        try {
            const result = await approveAction(id);
            if (result.success) {
                success("Pagamento aprovado com sucesso!");
                onClose();
            } else {
                toastError(result.error || "Erro ao aprovar.");
            }
        } catch (err) {
            toastError("Erro ao aprovar.");
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejeitar = async (reason: string) => {
        if (!rejectAction) return;
        setIsRejecting(true);
        try {
            const result = await rejectAction(id, reason);
            if (result.success) {
                success("Pagamento rejeitado. O participante precisará re-enviar.");
                onClose();
            } else {
                toastError(result.error || "Erro ao rejeitar.");
            }
        } catch (err) {
            toastError("Erro ao rejeitar.");
        } finally {
            setIsRejecting(false);
        }
    };

    return {
        file,
        setFile,
        isConfirming,
        isApproving,
        isRejecting,
        handleFileChange,
        handleConfirmar,
        handleAprovar,
        handleRejeitar
    };
}
