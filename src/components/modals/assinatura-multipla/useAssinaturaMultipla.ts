"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma, FrequenciaPagamento } from "@prisma/client";
import { parseLocalDate, calcularCustoBase } from "@/lib/financeiro-utils";
import { calculateWizardFinancials } from "@/lib/financeiro-projections";
import { isBefore, startOfDay, format as formatDate } from "date-fns";
import { StreamingOption, ParticipanteOption, SelectedStreaming, ModalStep } from "./types";

interface UseAssinaturaMultiplaProps {
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    onClose: () => void;
    onSave: (data: any) => void;
    diasVencimento?: number[];
    preSelectedParticipanteId?: string;
    preSelectedStreamingId?: string;
}

export function useAssinaturaMultipla({
    participantes,
    streamings,
    onClose,
    onSave,
    diasVencimento = [],
    preSelectedParticipanteId,
    preSelectedStreamingId
}: UseAssinaturaMultiplaProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State Sync with URL ---
    const step = useMemo(() => {
        const s = searchParams.get('step');
        return s ? parseInt(s) as ModalStep : ModalStep.STREAMING;
    }, [searchParams]);

    const selectedStreamingIds = useMemo(() => {
        const ids = searchParams.get('s');
        return new Set(ids ? ids.split(',').map(id => parseInt(id)) : []);
    }, [searchParams]);

    const selectedParticipanteIds = useMemo(() => {
        const ids = searchParams.get('p');
        return new Set(ids ? ids.split(',').map(id => parseInt(id)) : (preSelectedParticipanteId ? [parseInt(preSelectedParticipanteId)] : []));
    }, [searchParams, preSelectedParticipanteId]);

    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [cobrancaAutomaticaPaga, setCobrancaAutomaticaPaga] = useState(false);
    const [primeiroCicloJaPago, setPrimeiroCicloJaPago] = useState(false);
    const [configurations, setConfigurations] = useState<Map<number, SelectedStreaming>>(new Map());
    const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
    const [streamingSearchTerm, setStreamingSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");
    const [isOperationReviewOpen, setIsOperationReviewOpen] = useState(false);
    const [retroactivePaidIndices, setRetroactivePaidIndices] = useState<number[]>([]);

    // Helper to update URL
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    // --- Actions ---

    const handleToggleStreaming = useCallback((streamingId: number) => {
        const next = new Set(selectedStreamingIds);
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
        updateUrl({ s: next.size > 0 ? Array.from(next).join(',') : null });
    }, [selectedStreamingIds, configurations, streamings, updateUrl]);

    const totalVagasSelecionadas = useMemo(() =>
        Array.from(quantities.values()).reduce((acc, qty) => acc + qty, 0),
        [quantities]);

    const selectedStreamings = useMemo(() =>
        Array.from(selectedStreamingIds)
            .map(id => streamings.find(s => s.id === id))
            .filter(Boolean) as StreamingOption[],
        [selectedStreamingIds, streamings]);

    const minAvailableSlots = useMemo(() => {
        if (selectedStreamingIds.size === 0) return 0;
        const slots = selectedStreamings.map(s => s.limiteParticipantes - s.ocupados);
        const minTotal = Math.min(...slots);
        return Math.max(0, minTotal - totalVagasSelecionadas);
    }, [selectedStreamings, selectedStreamingIds, totalVagasSelecionadas]);

    const handleToggleParticipante = useCallback((id: number) => {
        const next = new Set(selectedParticipanteIds);
        const nextQuantities = new Map(quantities);

        if (next.has(id)) {
            next.delete(id);
            nextQuantities.delete(id);
        } else if (minAvailableSlots > 0) {
            next.add(id);
            nextQuantities.set(id, 1);
        }
        setQuantities(nextQuantities);
        updateUrl({ p: next.size > 0 ? Array.from(next).join(',') : null });
    }, [selectedParticipanteIds, quantities, minAvailableSlots, updateUrl]);

    const handleQuantityChange = useCallback((id: number, delta: number) => {
        const currentQty = quantities.get(id) || 1;
        const newQty = currentQty + delta;

        if (newQty <= 0) {
            handleToggleParticipante(id);
            return;
        }

        let totalUsedOther = 0;
        quantities.forEach((qty, pid) => {
            if (pid !== id) totalUsedOther += qty;
        });

        const minAvailable = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));

        if (totalUsedOther + newQty <= minAvailable) {
            setQuantities(prev => new Map(prev).set(id, newQty));
        }
    }, [quantities, selectedStreamings, handleToggleParticipante]);

    const handleSelectAllParticipantes = useCallback(() => {
        const filtered = !participanteSearchTerm
            ? participantes
            : participantes.filter(p =>
                p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) ||
                p.whatsappNumero.includes(participanteSearchTerm)
            );

        const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedParticipanteIds.has(p.id));

        const nextSet = new Set(selectedParticipanteIds);
        const nextQuantities = new Map(quantities);

        if (allFilteredSelected) {
            filtered.forEach(p => {
                nextSet.delete(p.id);
                nextQuantities.delete(p.id);
            });
        } else {
            const minAvailableSlotsGlobal = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));
            let currentTotal = Array.from(quantities.values()).reduce((a, b) => a + b, 0);

            filtered.forEach(p => {
                if (!nextSet.has(p.id) && currentTotal < minAvailableSlotsGlobal) {
                    nextSet.add(p.id);
                    nextQuantities.set(p.id, 1);
                    currentTotal++;
                }
            });
        }

        setQuantities(nextQuantities);
        updateUrl({ p: nextSet.size > 0 ? Array.from(nextSet).join(',') : null });
    }, [participanteSearchTerm, participantes, selectedParticipanteIds, selectedStreamings, quantities, updateUrl]);

    const handleUpdateConfig = useCallback((streamingId: number, field: keyof SelectedStreaming, value: any) => {
        setConfigurations(prev => {
            const current = prev.get(streamingId);
            if (!current) return prev;
            return new Map(prev).set(streamingId, { ...current, [field]: value });
        });
    }, []);

    const handleClose = useCallback(() => {
        setConfigurations(new Map());
        setQuantities(new Map());
        setDataInicio(new Date().toISOString().split('T')[0]);
        setCobrancaAutomaticaPaga(false);
        setPrimeiroCicloJaPago(false);
        setStreamingSearchTerm("");
        setParticipanteSearchTerm("");
        updateUrl({ step: null, s: null, p: null });
        onClose();
    }, [onClose, updateUrl]);


    // --- Computed ---

    const streamingsSemVagas = useMemo(() =>
        selectedStreamings.filter(s => {
            const available = s.limiteParticipantes - s.ocupados;
            return totalVagasSelecionadas > available;
        }),
        [selectedStreamings, totalVagasSelecionadas]);

    const isOverloaded = streamingsSemVagas.length > 0;

    const canNext = useCallback(() => {
        switch (step) {
            case ModalStep.STREAMING: return selectedStreamingIds.size > 0;
            case ModalStep.VALUES: return true;
            case ModalStep.PARTICIPANTS: return totalVagasSelecionadas > 0 && !isOverloaded;
            default: return false;
        }
    }, [step, selectedStreamingIds.size, totalVagasSelecionadas, isOverloaded]);

    const handleNext = useCallback(() => {
        if (canNext()) updateUrl({ step: (step + 1).toString() });
    }, [canNext, step, updateUrl]);

    const handleBack = useCallback(() => {
        updateUrl({ step: (step - 1).toString() });
    }, [step, updateUrl]);

    const financialAnalysis = useMemo(() => {
        return calculateWizardFinancials(
            configurations,
            selectedStreamings,
            totalVagasSelecionadas,
            dataInicio,
            diasVencimento
        );
    }, [configurations, totalVagasSelecionadas, selectedStreamings, diasVencimento, dataInicio]);

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
            cobrancaAutomaticaPaga,
            primeiroCicloJaPago,
            retroactivePaidIndices
        });
    }, [selectedParticipanteIds, configurations, isOverloaded, quantities, dataInicio, cobrancaAutomaticaPaga, primeiroCicloJaPago, retroactivePaidIndices, onSave]);

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
        primeiroCicloJaPago,
        setPrimeiroCicloJaPago,
        handleToggleStreaming,
        handleToggleParticipante,
        handleQuantityChange,
        handleSelectAllParticipantes,
        handleUpdateConfig,
        financialAnalysis,
        handleClose,
        handleNext,
        handleBack,
        handleSubmit,
        canNext,
        retroactivePaidIndices,
        setRetroactivePaidIndices
    };
}
