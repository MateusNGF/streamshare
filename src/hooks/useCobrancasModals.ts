"use client";

import { useState } from "react";

export function useCobrancasModals() {
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmPaymentModalOpen, setConfirmPaymentModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [batchPixModalOpen, setBatchPixModalOpen] = useState(false);
    const [selectedCobrancaId, setSelectedCobrancaId] = useState<number | null>(null);

    const openDetails = (id: number) => {
        setSelectedCobrancaId(id);
        setDetailsModalOpen(true);
    };

    const openConfirmPayment = (id: number) => {
        setSelectedCobrancaId(id);
        setConfirmPaymentModalOpen(true);
    };

    const openCancel = (id: number) => {
        setSelectedCobrancaId(id);
        setCancelModalOpen(true);
    };

    const openQrCode = (id: number) => {
        setSelectedCobrancaId(id);
        setQrModalOpen(true);
    };

    return {
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        qrModalOpen, setQrModalOpen,
        batchPixModalOpen, setBatchPixModalOpen,
        selectedCobrancaId, setSelectedCobrancaId,
        openDetails,
        openConfirmPayment,
        openCancel,
        openQrCode
    };
}
