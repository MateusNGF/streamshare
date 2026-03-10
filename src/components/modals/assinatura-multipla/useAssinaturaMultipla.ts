"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma, FrequenciaPagamento } from "@prisma/client";
import { useCurrency } from "@/hooks/useCurrency";
import { calcularCustoBase } from "@/lib/financeiro-utils";
import { calculateWizardFinancials } from "@/lib/financeiro-projections";
import { useWizardURLSync } from "./hooks/useWizardURLSync";
import { useToast } from "@/hooks/useToast";
import { StatusAssinatura } from "@prisma/client";
import { createBulkAssinaturas } from "@/actions/assinaturas";
import { format as formatDate } from "date-fns";
import { StreamingOption, ParticipanteOption, SelectedStreaming, ModalStep } from "./types";

interface UseAssinaturaMultiplaProps {
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    onClose: () => void;
    onSuccess: () => void;
    diasVencimento: number[];
    preSelectedParticipanteId?: string;
    preSelectedStreamingId?: string;
}

export function useAssinaturaMultipla({
    participantes,
    streamings,
    onClose,
    onSuccess,
    diasVencimento = [],
    preSelectedParticipanteId,
    preSelectedStreamingId
}: UseAssinaturaMultiplaProps) {
    const { updateUrl, getParam } = useWizardURLSync();
    const toast = useToast();

    // 1. Core State
    const [step, setStep] = useState(ModalStep.STREAMING);
    const [selectedStreamingIds, setSelectedStreamingIds] = useState<Set<number>>(new Set());
    const [configurations, setConfigurations] = useState<Map<number, SelectedStreaming>>(new Map());
    const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
    const [dataInicio, setDataInicio] = useState(formatDate(new Date(), "yyyy-MM-dd"));
    const [cobrancaAutomaticaPaga, setCobrancaAutomaticaPaga] = useState(true);
    const [primeiroCicloJaPago, setPrimeiroCicloJaPago] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [streamingSearchTerm, setStreamingSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");
    const [isOperationReviewOpen, setIsOperationReviewOpen] = useState(false);
    const [retroactivePaidPeriods, setRetroactivePaidPeriods] = useState<Array<{ streamingId: number, index: number }>>([]);

    // 2. Initialization from URL / Props
    useEffect(() => {
        const stepParam = getParam('step');
        if (stepParam) setStep(parseInt(stepParam) as ModalStep);

        const sParam = getParam('s');
        if (sParam && selectedStreamingIds.size === 0) {
            const ids = sParam.split(',').map(Number);
            setSelectedStreamingIds(new Set(ids));

            setConfigurations(prev => {
                const next = new Map(prev);
                ids.forEach(id => {
                    const s = streamings.find(x => x.id === id);
                    if (s && !next.has(id)) {
                        next.set(id, {
                            streamingId: id,
                            frequencia: FrequenciaPagamento.mensal,
                            valor: calcularCustoBase(s.valorIntegral, s.limiteParticipantes).toFixed(2)
                        });
                    }
                });
                return next;
            });
        }

        const pParam = getParam('p');
        if (pParam && quantities.size === 0) {
            const ids = pParam.split(',').map(Number);
            setQuantities(prev => {
                const next = new Map(prev);
                ids.forEach(id => {
                    if (!next.has(id)) next.set(id, 1);
                });
                return next;
            });
        }

        // Auto-skip logic for pre-selected mode
        if (preSelectedParticipanteId && preSelectedStreamingId) {
            setStep(ModalStep.SUMMARY);
        }

        // Pre-selected streaming
        if (preSelectedStreamingId && !sParam && selectedStreamingIds.size === 0) {
            const sId = parseInt(preSelectedStreamingId);
            const streaming = streamings.find(s => s.id === sId);
            if (streaming) {
                const valorPadrao = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);
                setSelectedStreamingIds(new Set([sId]));
                setConfigurations(new Map([[sId, {
                    streamingId: sId,
                    frequencia: FrequenciaPagamento.mensal,
                    valor: valorPadrao.toFixed(2)
                }]]));
                updateUrl({ s: sId.toString() });
            }
        }

        // Pre-selected participant
        if (preSelectedParticipanteId && !pParam && quantities.size === 0) {
            const pId = parseInt(preSelectedParticipanteId);
            setQuantities(new Map([[pId, 1]]));
            updateUrl({ p: pId.toString() });
        }

    }, [getParam, streamings, preSelectedStreamingId, preSelectedParticipanteId]);


    // Helper to update URL
    const updateUrlStep = useCallback((nextStep: ModalStep) => {
        updateUrl({ step: nextStep.toString() });
        setStep(nextStep);
    }, [updateUrl]);

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
        setSelectedStreamingIds(next);
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
        const nextQuantities = new Map(quantities);

        if (nextQuantities.has(id)) {
            nextQuantities.delete(id);
        } else if (minAvailableSlots > 0) {
            nextQuantities.set(id, 1);
        }

        setQuantities(nextQuantities);
        const ids = Array.from(nextQuantities.keys());
        updateUrl({ p: ids.length > 0 ? ids.join(',') : null });
    }, [quantities, minAvailableSlots, updateUrl]);

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
        const currentSelectedParticipanteIds = new Set(Array.from(quantities.keys()));
        const filtered = !participanteSearchTerm
            ? participantes
            : participantes.filter(p =>
                p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) ||
                p.whatsappNumero.includes(participanteSearchTerm)
            );

        const allFilteredSelected = filtered.length > 0 && filtered.every(p => currentSelectedParticipanteIds.has(p.id));

        const nextQuantities = new Map(quantities);

        if (allFilteredSelected) {
            filtered.forEach(p => {
                nextQuantities.delete(p.id);
            });
        } else {
            const minAvailableSlotsGlobal = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));
            let currentTotal = Array.from(quantities.values()).reduce((a, b) => a + b, 0);

            filtered.forEach(p => {
                if (!nextQuantities.has(p.id) && currentTotal < minAvailableSlotsGlobal) {
                    nextQuantities.set(p.id, 1);
                    currentTotal++;
                }
            });
        }

        setQuantities(nextQuantities);
        const ids = Array.from(nextQuantities.keys());
        updateUrl({ p: ids.length > 0 ? ids.join(',') : null });
    }, [participanteSearchTerm, participantes, quantities, selectedStreamings, updateUrl]);

    const handleUpdateConfig = useCallback((streamingId: number, field: keyof SelectedStreaming, value: any) => {
        setConfigurations(prev => {
            const current = prev.get(streamingId);
            if (!current) return prev;
            return new Map(prev).set(streamingId, { ...current, [field]: value });
        });
    }, []);

    const handleClose = useCallback(() => {
        setStep(ModalStep.STREAMING);
        setConfigurations(new Map());
        setQuantities(new Map());
        setDataInicio(formatDate(new Date(), "yyyy-MM-dd"));
        setCobrancaAutomaticaPaga(true);
        setPrimeiroCicloJaPago(true);
        setStreamingSearchTerm("");
        setParticipanteSearchTerm("");
        updateUrl({ step: null, s: null, p: null });
        onClose();
    }, [onClose, updateUrl]);


    // --- Computed ---

    const selectedParticipanteIds = useMemo(() => new Set(quantities.keys()), [quantities]);

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
            case ModalStep.PARTICIPANTS: return totalVagasSelecionadas > 0 && !isOverloaded;
            default: return false;
        }
    }, [step, selectedStreamingIds.size, totalVagasSelecionadas, isOverloaded]);

    const handleNext = useCallback(() => {
        if (canNext()) updateUrlStep(step + 1);
    }, [canNext, step, updateUrlStep]);

    const handleBack = useCallback(() => {
        if (step > 1) updateUrlStep(step - 1);
    }, [step, updateUrlStep]);

    const financialAnalysis = useMemo(() => {
        return calculateWizardFinancials(
            configurations,
            selectedStreamings,
            totalVagasSelecionadas,
            dataInicio,
            diasVencimento
        );
    }, [configurations, totalVagasSelecionadas, selectedStreamings, diasVencimento, dataInicio]);

    // Link "Lançamento Inicial" with retroactive periods
    useEffect(() => {
        if (primeiroCicloJaPago) {
            const allRetros = financialAnalysis.cobrancasProjetadas
                .filter(p => p.tipo === 'Retroativa')
                .map(p => ({ streamingId: p.streamingId, index: p.index }));
            setRetroactivePaidPeriods(allRetros);
        } else {
            setRetroactivePaidPeriods([]);
        }
    }, [primeiroCicloJaPago, financialAnalysis.cobrancasProjetadas.length]);

    const handleSubmit = useCallback(async () => {
        if (selectedParticipanteIds.size === 0 || configurations.size === 0 || isOverloaded) return;
        setIsSubmitting(true);

        try {
            const expandedParticipanteIds: number[] = [];
            selectedParticipanteIds.forEach(id => {
                const qty = quantities.get(id) || 1;
                for (let i = 0; i < qty; i++) expandedParticipanteIds.push(id);
            });

            const result = await createBulkAssinaturas({
                participanteIds: expandedParticipanteIds,
                assinaturas: Array.from(configurations.values()).map(config => ({
                    streamingId: config.streamingId,
                    frequencia: config.frequencia,
                    valor: parseFloat(config.valor)
                })),
                dataInicio,
                cobrancaAutomaticaPaga: cobrancaAutomaticaPaga,
                primeiroCicloJaPago: primeiroCicloJaPago,
                retroactivePaidPeriods: retroactivePaidPeriods || []
            });

            if (result.success) {
                toast.success("Assinaturas criadas com sucesso!");
                onSuccess();
                handleClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro inesperado ao criar assinaturas.");
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedParticipanteIds, configurations, isOverloaded, quantities, dataInicio, cobrancaAutomaticaPaga, primeiroCicloJaPago, retroactivePaidPeriods, onSuccess, handleClose]);

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
        isSubmitting,
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
        retroactivePaidPeriods,
        setRetroactivePaidPeriods
    };
}
