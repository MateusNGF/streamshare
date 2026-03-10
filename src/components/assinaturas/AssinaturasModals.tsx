"use client";

import { CancelarAssinaturaModal } from "@/components/modals/CancelarAssinaturaModal";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";

interface AssinaturasModalsProps {
    participantes: any[];
    streamingsWithOcupados: any[];

    cancelModalOpen: boolean;
    onCloseCancel: () => void;
    onConfirmCancel: (reason: string) => void;
    cancelling: boolean;
    selectedAssinatura: any;

    detailsModalOpen: boolean;
    onCloseDetails: () => void;
}

export function AssinaturasModals({
    cancelModalOpen,
    onCloseCancel,
    onConfirmCancel,
    cancelling,
    selectedAssinatura,
    detailsModalOpen,
    onCloseDetails
}: AssinaturasModalsProps) {
    return (
        <>
            <CancelarAssinaturaModal
                isOpen={cancelModalOpen}
                onClose={onCloseCancel}
                onConfirm={onConfirmCancel}
                assinatura={selectedAssinatura}
                loading={cancelling}
            />

            <DetalhesAssinaturaModal
                isOpen={detailsModalOpen}
                onClose={onCloseDetails}
                assinatura={selectedAssinatura}
                isAdmin={true}
            />
        </>
    );
}
