"use client";

import { useState } from "react";

export function useModalDetails() {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (date: Date | string | null, includeTime = false) => {
        if (!date) return "-";
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    const getWhatsAppUrl = (whatsappNumero: string | null) => {
        if (!whatsappNumero) return "#";
        return `https://wa.me/55${whatsappNumero.replace(/\D/g, '')}`;
    };

    return {
        copied,
        handleCopy,
        formatDate,
        getWhatsAppUrl
    };
}
