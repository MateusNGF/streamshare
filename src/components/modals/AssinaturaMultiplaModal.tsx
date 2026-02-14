"use client";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ChevronLeft, Check } from "lucide-react";

import { ModalStep, ParticipanteOption, StreamingOption } from "./assinatura-multipla/types";
import { useAssinaturaMultipla } from "./assinatura-multipla/useAssinaturaMultipla";

import { StepStreamings } from "./assinatura-multipla/components/StepStreamings";
import { StepConfiguration } from "./assinatura-multipla/components/StepConfiguration";
import { StepParticipants } from "./assinatura-multipla/components/StepParticipants";
import { StepSummary } from "./assinatura-multipla/components/StepSummary";
import { CreationSummary } from "./assinatura-multipla/components/CreationSummary";

interface AssinaturaMultiplaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    loading: boolean;
}

export function AssinaturaMultiplaModal({
    isOpen,
    onClose,
    onSave,
    participantes,
    streamings,
    loading
}: AssinaturaMultiplaModalProps) {
    const logic = useAssinaturaMultipla({
        participantes,
        streamings,
        onClose,
        onSave
    });

    const renderFooter = () => (
        <div className="w-full space-y-4">
            <CreationSummary
                isOpen={logic.isOperationReviewOpen}
                onToggle={() => logic.setIsOperationReviewOpen(!logic.isOperationReviewOpen)}
                selectedStreamingIds={logic.selectedStreamingIds}
                selectedStreamings={logic.selectedStreamings}
                configurations={logic.configurations}
                selectedParticipanteIds={logic.selectedParticipanteIds}
                participantes={participantes}
                participanteVagasMap={logic.participanteVagasMap}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6 sm:gap-0">
                {/* Step Indicators */}
                <div className="flex gap-2 mb-2 sm:mb-0">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`h-2 w-12 rounded-full transition-all duration-500 ${s <= logic.step ? 'bg-primary' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                    {logic.step > ModalStep.STREAMING && (
                        <button
                            type="button"
                            onClick={logic.handleBack}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            <ChevronLeft size={18} />
                            <span>Voltar</span>
                        </button>
                    )}

                    {logic.step < ModalStep.SUMMARY ? (
                        <button
                            type="button"
                            onClick={logic.handleNext}
                            disabled={!logic.canNext()}
                            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-accent text-white rounded-xl font-black shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={logic.handleSubmit}
                            disabled={logic.selectedParticipanteIds.size === 0 || loading || logic.isOverloaded}
                            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-accent text-white rounded-xl font-black shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" color="white" />
                                    <span>Criando Assinaturas...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>Finalizar e Criar</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={logic.handleClose}
            title="Lote de Assinaturas"
            className="sm:max-w-4xl"
            footer={renderFooter()}
        >
            <div className="animate-in fade-in duration-500">
                {logic.step === ModalStep.STREAMING && (
                    <StepStreamings
                        streamings={streamings}
                        selectedIds={logic.selectedStreamingIds}
                        onToggle={logic.handleToggleStreaming}
                        searchTerm={logic.streamingSearchTerm}
                        onSearchChange={logic.setStreamingSearchTerm}
                    />
                )}

                {logic.step === ModalStep.VALUES && (
                    <StepConfiguration
                        selectedStreamings={logic.selectedStreamings}
                        configurations={logic.configurations}
                        onUpdate={logic.handleUpdateConfig}
                    />
                )}

                {logic.step === ModalStep.PARTICIPANTS && (
                    <StepParticipants
                        participantes={participantes}
                        selectedIds={logic.selectedParticipanteIds}
                        quantities={logic.participanteVagasMap}
                        onToggle={logic.handleToggleParticipante}
                        onQuantityChange={logic.handleQuantityChange}
                        onSelectAll={logic.handleSelectAllParticipantes}
                        searchTerm={logic.participanteSearchTerm}
                        onSearchChange={logic.setParticipanteSearchTerm}
                        capacityInfo={{
                            isOverloaded: logic.isOverloaded,
                            minSlots: logic.minAvailableSlots,
                            showWarning: logic.selectedStreamingIds.size > 0
                        }}
                    />
                )}

                {logic.step === ModalStep.SUMMARY && (
                    <StepSummary
                        selectedStreamings={logic.selectedStreamings}
                        selectedParticipants={Array.from(logic.selectedParticipanteIds).map(id => {
                            const original = participantes.find(p => p.id === id);
                            return original ? { ...original, quantidade: logic.participanteVagasMap.get(id) || 1 } : null;
                        }).filter(Boolean) as ParticipanteOption[]}
                        configurations={logic.configurations}
                        dataInicio={logic.dataInicio}
                        onDataInicioChange={logic.setDataInicio}
                        cobrancaAutomatica={logic.cobrancaAutomaticaPaga}
                        onCobrancaChange={logic.setCobrancaAutomaticaPaga}
                        overloadedStreamings={logic.streamingsSemVagas}
                    />
                )}
            </div>
        </Modal>
    );
}
