"use client";

import { useState, useMemo, useCallback } from "react";
import { FrequenciaPagamento } from "@prisma/client";
import { calcularCustoBase } from "@/lib/financeiro-utils";
import { StreamingOption, ParticipanteOption, SelectedStreaming, ModalStep } from "./types";

interface UseAssinaturaMultiplaProps {
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    onClose: () => void;
    onSave: (data: any) => void;
}

export function useAssinaturaMultipla({
    participantes,
    streamings,
    onClose,
    onSave
}: UseAssinaturaMultiplaProps) {
    const [step, setStep] = useState<ModalStep>(ModalStep.STREAMING);
    const [selectedParticipanteIds, setSelectedParticipanteIds] = useState<Set<number>>(new Set());
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [cobrancaAutomaticaPaga, setCobrancaAutomaticaPaga] = useState(false);
    const [selectedStreamingIds, setSelectedStreamingIds] = useState<Set<number>>(new Set());
    const [configurations, setConfigurations] = useState<Map<number, SelectedStreaming>>(new Map());
    const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
    const [streamingSearchTerm, setStreamingSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");
    const [isOperationReviewOpen, setIsOperationReviewOpen] = useState(false);

    // --- Actions ---

    const handleToggleStreaming = useCallback((streamingId: number) => {
        setSelectedStreamingIds(prev => {
            const next = new Set(prev);
            const nextConfigs = new Map(configurations);

            if (next.has(streamingId)) {
                next.delete(streamingId);
                nextConfigs.delete(streamingId);
            } else {
                next.add(streamingId);
                const streaming = streamings.find(s => s.id === streamingId);
                if (streaming) {
                    const valorPadrao = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);
                    nextConfigs.set(streamingId, {
                        streamingId,
                        frequencia: FrequenciaPagamento.mensal,
                        valor: valorPadrao.toFixed(2)
                    });
                }
            }
            setConfigurations(nextConfigs);
            return next;
        });
    }, [streamings, configurations]);

    const handleToggleParticipante = useCallback((id: number) => {
        setSelectedParticipanteIds(prev => {
            const next = new Set(prev);
            const nextQuantities = new Map(quantities);

            if (next.has(id)) {
                next.delete(id);
                nextQuantities.delete(id);
            } else {
                next.add(id);
                nextQuantities.set(id, 1);
            }
            setQuantities(nextQuantities);
            return next;
        });
    }, [quantities]);

    const totalVagasSelecionadas = useMemo(() =>
        Array.from(quantities.values()).reduce((acc, qty) => acc + qty, 0),
        [quantities]);

    const selectedStreamings = useMemo(() =>
        Array.from(selectedStreamingIds)
            .map(id => streamings.find(s => s.id === id))
            .filter(Boolean) as StreamingOption[],
        [selectedStreamingIds, streamings]);

    const handleQuantityChange = useCallback((id: number, delta: number) => {
        const currentQty = quantities.get(id) || 1;
        const newQty = Math.max(1, currentQty + delta);

        let totalUsedOther = 0;
        quantities.forEach((qty, pid) => {
            if (pid !== id) totalUsedOther += qty;
        });

        // Tightest constraint among selected streamings
        const minAvailable = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));

        if (totalUsedOther + newQty <= minAvailable) {
            setQuantities(prev => new Map(prev).set(id, newQty));
        }
    }, [quantities, selectedStreamings]);

    const handleSelectAllParticipantes = useCallback(() => {
        const filtered = !participanteSearchTerm
            ? participantes
            : participantes.filter(p =>
                p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) ||
                p.whatsappNumero.includes(participanteSearchTerm)
            );

        if (selectedParticipanteIds.size === filtered.length) {
            setSelectedParticipanteIds(new Set());
            setQuantities(new Map());
        } else {
            const minAvailable = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));
            const nextSet = new Set(selectedParticipanteIds);
            const nextQuantities = new Map(quantities);

            let currentTotal = Array.from(nextQuantities.values()).reduce((a, b) => a + b, 0);

            filtered.forEach(p => {
                if (!nextSet.has(p.id) && currentTotal < minAvailable) {
                    nextSet.add(p.id);
                    nextQuantities.set(p.id, 1);
                    currentTotal++;
                }
            });

            setSelectedParticipanteIds(nextSet);
            setQuantities(nextQuantities);
        }
    }, [participanteSearchTerm, participantes, selectedParticipanteIds, selectedStreamings, quantities]);

    const handleUpdateConfig = useCallback((streamingId: number, field: keyof SelectedStreaming, value: any) => {
        setConfigurations(prev => {
            const current = prev.get(streamingId);
            if (!current) return prev;
            return new Map(prev).set(streamingId, { ...current, [field]: value });
        });
    }, []);

    const handleClose = useCallback(() => {
        setStep(ModalStep.STREAMING);
        setSelectedParticipanteIds(new Set());
        setQuantities(new Map());
        setDataInicio(new Date().toISOString().split('T')[0]);
        setCobrancaAutomaticaPaga(false);
        setSelectedStreamingIds(new Set());
        setConfigurations(new Map());
        setStreamingSearchTerm("");
        setParticipanteSearchTerm("");
        onClose();
    }, [onClose]);

    // --- Computed ---

    const streamingsSemVagas = useMemo(() =>
        selectedStreamings.filter(s => {
            const available = s.limiteParticipantes - s.ocupados;
            return totalVagasSelecionadas > available;
        }),
        [selectedStreamings, totalVagasSelecionadas]);

    const isOverloaded = streamingsSemVagas.length > 0;

    const minAvailableSlots = useMemo(() => {
        if (selectedStreamingIds.size === 0) return Infinity;
        const slots = selectedStreamings.map(s => s.limiteParticipantes - s.ocupados);
        return Math.min(...slots);
    }, [selectedStreamings, selectedStreamingIds]);

    const canNext = useCallback(() => {
        switch (step) {
            case ModalStep.STREAMING: return selectedStreamingIds.size > 0;
            case ModalStep.VALUES: return true;
            case ModalStep.PARTICIPANTS: return totalVagasSelecionadas > 0 && !isOverloaded;
            default: return false;
        }
    }, [step, selectedStreamingIds.size, totalVagasSelecionadas, isOverloaded]);

    const handleNext = useCallback(() => {
        if (canNext()) setStep(prev => prev + 1);
    }, [canNext]);

    const handleBack = useCallback(() => setStep(prev => prev - 1), []);

    const handleSubmit = useCallback(() => {
        if (selectedParticipanteIds.size === 0 || configurations.size === 0 || isOverloaded) return;

        const expandedParticipanteIds: number[] = [];
        selectedParticipanteIds.forEach(id => {
            const qty = quantities.get(id) || 1;
            for (let i = 0; i < qty; i++) expandedParticipanteIds.push(id);
        });

        onSave({
            participanteIds: expandedParticipanteIds,
            assinaturas: Array.from(configurations.values()).map(config => ({
                streamingId: config.streamingId,
                frequencia: config.frequencia,
                valor: parseFloat(config.valor)
            })),
            dataInicio,
            cobrancaAutomaticaPaga
        });
    }, [selectedParticipanteIds, configurations, isOverloaded, quantities, dataInicio, cobrancaAutomaticaPaga, onSave]);

    return {
        step,
        selectedParticipanteIds,
        dataInicio,
        cobrancaAutomaticaPaga,
        selectedStreamingIds,
        configurations,
        participanteVagasMap: quantities,
        streamingSearchTerm,
        participanteSearchTerm,
        isOperationReviewOpen,
        totalVagasSelecionadas,
        selectedStreamings,
        streamingsSemVagas,
        isOverloaded,
        minAvailableSlots,
        setStreamingSearchTerm,
        setParticipanteSearchTerm,
        setIsOperationReviewOpen,
        setDataInicio,
        setCobrancaAutomaticaPaga,
        handleToggleStreaming,
        handleToggleParticipante,
        handleQuantityChange,
        handleSelectAllParticipantes,
        handleUpdateConfig,
        handleClose,
        handleNext,
        handleBack,
        handleSubmit,
        canNext
    };
}
