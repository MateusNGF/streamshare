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
    const [participantStreamings, setParticipantStreamings] = useState<Map<number, Set<number>>>(new Map());
    const [dataInicio, setDataInicio] = useState(formatDate(new Date(), "yyyy-MM-dd"));
    const [cobrancaAutomaticaPaga, setCobrancaAutomaticaPaga] = useState(true);
    const [primeiroCicloJaPago, setPrimeiroCicloJaPago] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [streamingSearchTerm, setStreamingSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");
    const [isOperationReviewOpen, setIsOperationReviewOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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
        // Format p=pid:s1-s2,pid2:s1
        if (pParam && participantStreamings.size === 0) {
            const next = new Map<number, Set<number>>();
            pParam.split(',').forEach(pair => {
                const [pIdStr, sIdsStr] = pair.split(':');
                if (pIdStr && sIdsStr) {
                    const pId = Number(pIdStr);
                    const sIds = new Set(sIdsStr.split('-').map(Number));
                    next.set(pId, sIds);
                }
            });
            setParticipantStreamings(next);
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
        if (preSelectedParticipanteId && !pParam && participantStreamings.size === 0 && preSelectedStreamingId) {
            const pId = parseInt(preSelectedParticipanteId);
            const sId = parseInt(preSelectedStreamingId);
            setParticipantStreamings(new Map([[pId, new Set([sId])]]));
            updateUrl({ p: `${pId}:${sId}` });
        }

    }, [getParam, streamings, preSelectedStreamingId, preSelectedParticipanteId]);


    // Helper to update URL
    const updateUrlStep = useCallback((nextStep: ModalStep) => {
        setStreamingSearchTerm("");
        setParticipanteSearchTerm("");
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

    const totalVagasSelecionadas = useMemo(() => {
        let sum = 0;
        participantStreamings.forEach(subs => sum += subs.size);
        return sum;
    }, [participantStreamings]);

    const handleToggleParticipantStreaming = useCallback((participantId: number, streamingId: number) => {
        setParticipantStreamings(prev => {
            const next = new Map(prev);
            const set = next.get(participantId) || new Set<number>();
            const nextSet = new Set(set);

            if (nextSet.has(streamingId)) {
                nextSet.delete(streamingId);
                if (nextSet.size === 0) {
                    next.delete(participantId);
                } else {
                    next.set(participantId, nextSet);
                }
            } else {
                const str = streamings.find(s => s.id === streamingId);
                if (!str) return prev;

                let used = 0;
                next.forEach(subs => {
                    if (subs.has(streamingId)) used++;
                });
                const available = str.limiteParticipantes - str.ocupados;

                if (used < available) {
                    nextSet.add(streamingId);
                    next.set(participantId, nextSet);
                } else {
                    toast.error(`Vagas esgotadas para ${str.nome}`);
                    return prev;
                }
            }

            const parts: string[] = [];
            next.forEach((sIds, pId) => {
                parts.push(`${pId}:${Array.from(sIds).join('-')}`);
            });
            updateUrl({ p: parts.length > 0 ? parts.join(',') : null });

            return next;
        });
    }, [streamings, updateUrl, toast]);

    // Optional: a helper to toggle a streaming for all visible participants
    const handleToggleAllForStreaming = useCallback((streamingId: number) => {
        setParticipantStreamings(prev => {
            const next = new Map(prev);
            const filtered = !participanteSearchTerm
                ? participantes
                : participantes.filter(p =>
                    p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) ||
                    p.whatsappNumero.includes(participanteSearchTerm)
                );

            const str = streamings.find(s => s.id === streamingId);
            if (!str) return prev;

            let used = 0;
            next.forEach(subs => {
                if (subs.has(streamingId)) used++;
            });
            let available = (str.limiteParticipantes - str.ocupados) - used;

            // Check if all filtered already have it
            const allHaveIt = filtered.every(p => {
                const set = next.get(p.id);
                return set && set.has(streamingId);
            });

            if (allHaveIt) {
                // Remove from all filtered
                filtered.forEach(p => {
                    const set = next.get(p.id);
                    if (set && set.has(streamingId)) {
                        const nextSet = new Set(set);
                        nextSet.delete(streamingId);
                        if (nextSet.size === 0) {
                            next.delete(p.id);
                        } else {
                            next.set(p.id, nextSet);
                        }
                    }
                });
            } else {
                // Add to all filtered (up to capacity)
                for (const p of filtered) {
                    if (available <= 0) break;
                    const set = next.get(p.id) || new Set<number>();
                    if (!set.has(streamingId)) {
                        const nextSet = new Set(set);
                        nextSet.add(streamingId);
                        next.set(p.id, nextSet);
                        available--;
                    }
                }
            }

            const parts: string[] = [];
            next.forEach((sIds, pId) => {
                parts.push(`${pId}:${Array.from(sIds).join('-')}`);
            });
            updateUrl({ p: parts.length > 0 ? parts.join(',') : null });

            return next;
        });
    }, [participantes, participanteSearchTerm, streamings, updateUrl]);

    const handleUpdateConfig = useCallback((streamingId: number, field: keyof SelectedStreaming, value: any) => {
        setConfigurations(prev => {
            const current = prev.get(streamingId);
            if (!current) return prev;
            return new Map(prev).set(streamingId, { ...current, [field]: value });
        });
    }, []);

    const confirmClose = useCallback(() => {
        setIsCancelModalOpen(false);
        setStep(ModalStep.STREAMING);
        setConfigurations(new Map());
        setParticipantStreamings(new Map());
        setDataInicio(formatDate(new Date(), "yyyy-MM-dd"));
        setCobrancaAutomaticaPaga(true);
        setPrimeiroCicloJaPago(true);
        setStreamingSearchTerm("");
        setParticipanteSearchTerm("");
        updateUrl({ step: null, s: null, p: null });
        onClose();
    }, [onClose, updateUrl]);

    const handleClose = useCallback(() => {
        if (selectedStreamingIds.size > 0 || participantStreamings.size > 0) {
            setIsCancelModalOpen(true);
            return;
        }
        confirmClose();
    }, [selectedStreamingIds.size, participantStreamings.size, confirmClose]);

    // --- Computed ---

    const selectedParticipanteIds = useMemo(() => new Set(participantStreamings.keys()), [participantStreamings]);

    const selectedStreamings = useMemo(() =>
        Array.from(selectedStreamingIds)
            .map(id => streamings.find(s => s.id === id))
            .filter(Boolean) as StreamingOption[],
        [selectedStreamingIds, streamings]);

    const streamingsSemVagas = useMemo(() => {
        return selectedStreamings.filter(s => {
            let used = 0;
            participantStreamings.forEach(subs => {
                if (subs.has(s.id)) used++;
            });
            const available = s.limiteParticipantes - s.ocupados;
            return used > available;
        });
    }, [selectedStreamings, participantStreamings]);

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
        setRetroactivePaidPeriods(prev => {
            if (primeiroCicloJaPago) {
                // Keep manual choices intact, only add ones we don't have if we were strictly toggling?
                // Actually, if we just overwrite only when primeiroCicloJaPago changes from false to true, we can do:
                const allRetros = financialAnalysis.cobrancasProjetadas
                    .filter(p => p.tipo === 'Retroativa')
                    .map(p => ({ streamingId: p.streamingId, index: p.index }));
                return allRetros;
            } else {
                return [];
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primeiroCicloJaPago]); // Removed financialAnalysis from deps to prevent overwriting manual selections

    const handleSubmit = useCallback(async () => {
        if (selectedParticipanteIds.size === 0 || configurations.size === 0 || isOverloaded) return;
        setIsSubmitting(true);

        try {
            const assinaturasList: Array<{ participanteId: number, streamingId: number, frequencia: string, valor: number }> = [];

            participantStreamings.forEach((sIds, pId) => {
                sIds.forEach(sId => {
                    const config = configurations.get(sId);
                    if (config) {
                        assinaturasList.push({
                            participanteId: pId,
                            streamingId: sId,
                            frequencia: config.frequencia,
                            valor: parseFloat(config.valor)
                        });
                    }
                });
            });

            // Pass the precise mapping of each participant to its specific streamings
            const result = await createBulkAssinaturas({
                assinaturasDedicadas: assinaturasList,
                dataInicio,
                cobrancaAutomaticaPaga: cobrancaAutomaticaPaga,
                primeiroCicloJaPago: primeiroCicloJaPago,
                retroactivePaidPeriods: retroactivePaidPeriods || []
            } as any); // temporary cast to any while we update the actions

            if (result.success) {
                toast.success("Assinaturas criadas com sucesso!");
                onSuccess();
                confirmClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro inesperado ao criar assinaturas.");
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedParticipanteIds, configurations, isOverloaded, participantStreamings, dataInicio, cobrancaAutomaticaPaga, primeiroCicloJaPago, retroactivePaidPeriods, onSuccess, confirmClose]);

    return {
        step,
        selectedParticipanteIds,
        dataInicio,
        cobrancaAutomaticaPaga,
        selectedStreamingIds,
        configurations,
        participantStreamings,
        streamingSearchTerm,
        participanteSearchTerm,
        isOperationReviewOpen,
        totalVagasSelecionadas,
        selectedStreamings,
        streamingsSemVagas,
        isOverloaded,
        isSubmitting,
        setStreamingSearchTerm,
        setParticipanteSearchTerm,
        setIsOperationReviewOpen,
        setDataInicio,
        setCobrancaAutomaticaPaga,
        primeiroCicloJaPago,
        setPrimeiroCicloJaPago,
        handleToggleStreaming,
        handleToggleParticipantStreaming,
        handleToggleAllForStreaming,
        handleUpdateConfig,
        financialAnalysis,
        handleClose,
        handleNext,
        handleBack,
        handleSubmit,
        canNext,
        isCancelModalOpen,
        setIsCancelModalOpen,
        confirmClose,
        retroactivePaidPeriods,
        setRetroactivePaidPeriods
    };
}
