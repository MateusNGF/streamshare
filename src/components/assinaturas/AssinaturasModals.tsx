"use client";

import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { CancelarAssinaturaModal } from "@/components/modals/CancelarAssinaturaModal";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";

interface AssinaturasModalsProps {
    isMultipleModalOpen: boolean;
    onCloseMultiple: () => void;
    onSaveMultiple: (data: any) => void;
    loading: boolean;
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
    isMultipleModalOpen,
    onCloseMultiple,
    onSaveMultiple,
    loading,
    participantes,
    streamingsWithOcupados,
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
            <AssinaturaMultiplaModal
                isOpen={isMultipleModalOpen}
                onClose={onCloseMultiple}
                onSave={onSaveMultiple}
                participantes={participantes}
                streamings={streamingsWithOcupados}
                loading={loading}
            />

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
