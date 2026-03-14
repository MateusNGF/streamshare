"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import {
    confirmarPagamento,
    enviarNotificacaoCobranca,
    cancelarCobranca,
    criarLotePagamento,
    confirmarLotePagamento,
    enviarWhatsAppEmLote
} from "@/actions/cobrancas";

export function useCobrancasOperations() {
    const toast = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [pendingActions, setPendingActions] = useState<Map<number, NodeJS.Timeout>>(new Map());

    const handleConfirmPayment = async (id: number, formData?: FormData) => {
        // Se já houver uma ação pendente para este ID, cancela a anterior
        if (pendingActions.has(id)) {
            clearTimeout(pendingActions.get(id));
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const result = await confirmarPagamento(id, formData);
                if (result.success) {
                    toast.success("Pagamento confirmado com sucesso!");
                    router.refresh();
                    setTimeout(() => window.location.reload(), 500);
                } else if (result.error) {
                    toast.error(result.error);
                }
            } catch (error) {
                toast.error("Erro ao confirmar pagamento");
            } finally {
                setLoading(false);
                setPendingActions(prev => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
            }
        }, 5000);

        setPendingActions(prev => new Map(prev).set(id, timer));

        toast.success("Confirmando pagamento...", 5000, {
            label: "Desfazer",
            onClick: () => {
                clearTimeout(timer);
                setPendingActions(prev => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
                toast.info("Ação desfeita com sucesso.");
            }
        });
    };

    const handleCancelCobranca = async (id: number) => {
        setLoading(true);
        try {
            const result = await cancelarCobranca(id);
            if (result.success) {
                toast.success("Cobrança cancelada com sucesso!");
                router.refresh();
                setTimeout(() => window.location.reload(), 500);
                return true;
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao cancelar cobrança");
        } finally {
            setLoading(false);
        }
        return false;
    };

    const handleSendNotification = async (id: number) => {
        try {
            const result = await enviarNotificacaoCobranca(id);
            if (result.success && result.data) {
                if (result.data.manualLink) {
                    window.open(result.data.manualLink, '_blank');
                    toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
                } else {
                    toast.success("Notificação WhatsApp enviada automaticamente!");
                }
                return true;
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar notificação");
        }
        return false;
    };

    const handleCreateBatchLote = async (ids: number[]) => {
        if (ids.length === 0) return false;
        setLoading(true);
        try {
            const result = await criarLotePagamento(ids, true);
            if (result.success && result.data) {
                router.push(`/cobrancas/lotes?loteId=${result.data.id}`);
                return true;
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao preparar lote de pagamento");
        } finally {
            setLoading(false);
        }
        return false;
    };

    const handleConfirmBatchLote = async (loteId: number) => {
        setLoading(true);
        try {
            const result = await confirmarLotePagamento(loteId);
            if (result.success) {
                toast.success("Lote confirmado com sucesso!");
                router.refresh();
                setTimeout(() => window.location.reload(), 500);
                return true;
            } else {
                toast.error(result.error || "Erro ao confirmar lote");
            }
        } catch (error) {
            toast.error("Erro ao confirmar lote");
        } finally {
            setLoading(false);
        }
        return false;
    };

    const handleSendBatchWhatsApp = async (ids: number[]) => {
        if (ids.length === 0) return false;
        setWhatsappLoading(true);
        try {
            const result = await enviarWhatsAppEmLote(ids);
            if (result.success && result.data) {
                const manualLinks = result.data.filter((r: any) => r.manualLink);
                const sentCount = result.data.filter((r: any) => r.success).length;

                if (manualLinks.length > 0) {
                    manualLinks.forEach((l: any) => window.open(l.manualLink, '_blank'));
                    toast.info(`${manualLinks.length} links do WhatsApp abertos!`);
                } else if (sentCount > 0) {
                    toast.success(`${sentCount} notificações enviadas com sucesso!`);
                }
                return true;
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao enviar mensagens em lote");
        } finally {
            setWhatsappLoading(false);
        }
        return false;
    };

    return {
        loading,
        whatsappLoading,
        handleConfirmPayment,
        handleCancelCobranca,
        handleSendNotification,
        handleCreateBatchLote,
        handleConfirmBatchLote,
        handleSendBatchWhatsApp
    };
}
