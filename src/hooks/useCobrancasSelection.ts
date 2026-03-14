"use client";

import { useState, useMemo } from "react";

export function useCobrancasSelection(cobrancas: any[]) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const batchTotal = useMemo(() => {
        return Array.from(selectedIds).reduce((sum, id) => {
            const cobranca = cobrancas.find(c => c.id === id);
            return sum + (cobranca ? Number(cobranca.valor) : 0);
        }, 0);
    }, [selectedIds, cobrancas]);

    const hasMixedParticipants = useMemo(() => {
        if (selectedIds.size <= 1) return false;
        const idsArray = Array.from(selectedIds);
        const firstCobranca = cobrancas.find(c => c.id === idsArray[0]);
        if (!firstCobranca) return false;

        const firstParticipantId = firstCobranca.assinatura.participanteId;
        return idsArray.some(id => {
            const c = cobrancas.find(curr => curr.id === id);
            return c && c.assinatura.participanteId !== firstParticipantId;
        });
    }, [selectedIds, cobrancas]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = (ids: number[]) => {
        setSelectedIds(new Set(ids));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    return {
        selectedIds,
        batchTotal,
        hasMixedParticipants,
        toggleSelection,
        selectAll,
        clearSelection
    };
}
