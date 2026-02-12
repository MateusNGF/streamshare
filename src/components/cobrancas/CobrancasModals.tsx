"use client";

import { CancelarCobrancaModal } from "@/components/modals/CancelarCobrancaModal";
import { ConfirmarPagamentoModal } from "@/components/modals/ConfirmarPagamentoModal";
import { DetalhesCobrancaModal } from "@/components/modals/DetalhesCobrancaModal";

interface CobrancasModalsProps {
    cancelModalOpen: boolean;
    onCloseCancel: () => void;
    onConfirmCancel: () => void;
    confirmPaymentModalOpen: boolean;
    onCloseConfirmPayment: () => void;
    onConfirmPayment: () => void;
    detailsModalOpen: boolean;
    onCloseDetails: () => void;
    selectedCobranca: any;
    loading: boolean;
}

export function CobrancasModals({
    cancelModalOpen,
    onCloseCancel,
    onConfirmCancel,
    confirmPaymentModalOpen,
    onCloseConfirmPayment,
    onConfirmPayment,
    detailsModalOpen,
    onCloseDetails,
    selectedCobranca,
    loading
}: CobrancasModalsProps) {
    return (
        <>
            <CancelarCobrancaModal
                isOpen={cancelModalOpen}
                onClose={onCloseCancel}
                onConfirm={onConfirmCancel}
                loading={loading}
            />

            <ConfirmarPagamentoModal
                isOpen={confirmPaymentModalOpen}
                onClose={onCloseConfirmPayment}
                onConfirm={onConfirmPayment}
                loading={loading}
            />

            <DetalhesCobrancaModal
                isOpen={detailsModalOpen}
                onClose={onCloseDetails}
                cobranca={selectedCobranca}
            />
        </>
    );
}
