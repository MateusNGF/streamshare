"use client";

import { useAssinaturaMultipla } from "@/components/modals/assinatura-multipla/useAssinaturaMultipla";
import { cn } from "@/lib/utils";
import { ModalStep, ParticipanteOption, StreamingOption } from "@/components/modals/assinatura-multipla/types";
import { StepStreamings } from "@/components/modals/assinatura-multipla/components/StepStreamings";
import { StepParticipants } from "@/components/modals/assinatura-multipla/components/StepParticipants";
import { StepSummary } from "@/components/modals/assinatura-multipla/components/StepSummary";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ChevronLeft, Check, Wand2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { createAssinatura, createBulkAssinaturas } from "@/actions/assinaturas";
import { useState, useEffect } from "react";
import { getAccountDiasVencimento } from "@/actions/settings";

interface AssinaturaWizardProps {
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    initialDiasVencimento?: number[];
}

export function AssinaturaWizard({ participantes, streamings, initialDiasVencimento = [] }: AssinaturaWizardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const diasVencimento = initialDiasVencimento;

    const preSelectedParticipanteId = searchParams.get("participanteId") || undefined;
    const preSelectedStreamingId = searchParams.get("streamingId") || undefined;


    const logic = useAssinaturaMultipla({
        participantes,
        streamings,
        onClose: () => router.push("/assinaturas"),
        onSuccess: () => {
            router.push("/assinaturas");
            router.refresh();
        },
        diasVencimento,
        preSelectedParticipanteId,
        preSelectedStreamingId
    });

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
                    <Wand2 size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Nova Assinatura
                    </h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider opacity-60">
                        {logic.step === ModalStep.STREAMING && "Selecione os serviços desejados"}
                        {logic.step === ModalStep.PARTICIPANTS && "Vincule os participantes e suas vagas"}
                        {logic.step === ModalStep.SUMMARY && "Revise e finalize o lançamento"}
                    </p>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={logic.handleClose}
                className="rounded-full hover:bg-gray-100"
            >
                <X size={20} className="text-gray-400" />
            </Button>
        </div>
    );

    const renderFooter = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 lg:p-6 z-50">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
                {/* Step Indicators */}
                <div className="flex gap-2.5">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={cn(
                                "h-1.5 w-12 rounded-full transition-all duration-300",
                                s <= logic.step ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]' : 'bg-gray-100'
                            )}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                    {logic.step > ModalStep.STREAMING && (
                        <Button
                            variant="outline"
                            onClick={logic.handleBack}
                            disabled={logic.isSubmitting}
                            className="flex-1 sm:flex-none px-6 h-12 rounded-2xl font-bold border-gray-100/80 hover:bg-gray-50/50"
                        >
                            <ChevronLeft size={20} className="mr-2" />
                            Voltar
                        </Button>
                    )}

                    {logic.step < ModalStep.SUMMARY ? (
                        <Button
                            onClick={logic.handleNext}
                            disabled={!logic.canNext()}
                            className="flex-1 sm:flex-none px-10 h-12 bg-primary hover:bg-accent text-white rounded-2xl font-black shadow-lg shadow-primary/25 transition-all active:scale-95"
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            onClick={logic.handleSubmit}
                            disabled={logic.selectedParticipanteIds.size === 0 || logic.isSubmitting || logic.isOverloaded}
                            className="flex-1 sm:flex-none px-10 h-12 bg-primary hover:bg-accent text-white rounded-2xl font-black shadow-lg shadow-primary/25 transition-all active:scale-95"
                        >
                            {logic.isSubmitting ? (
                                <>
                                    <Spinner size="sm" color="white" className="mr-2" />
                                    <span>Criando...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={18} className="mr-2" />
                                    <span>Finalizar</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-32">
            {logic.isSubmitting && (
                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center pointer-events-auto animate-in fade-in duration-500">
                    <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] flex flex-col items-center gap-6 animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border border-white">
                        <div className="relative">
                            <Spinner size="xl" color="primary" className="opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Wand2 className="text-primary animate-pulse" size={24} />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Processando Lote</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Organizando faturamento e acessos...</p>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={logic.isCancelModalOpen} onOpenChange={logic.setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar operação?</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 mb-6 text-sm">
                        Seu progresso da assinatura em lote não será salvo. Você precisará selecionar os participantes e streamings novamente caso retorne.
                        Tem certeza que deseja sair?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => logic.setIsCancelModalOpen(false)}>
                            Continuar Editando
                        </Button>
                        <Button
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-none font-bold"
                            onClick={logic.confirmClose}
                        >
                            Sim, Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {renderHeader()}

                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {logic.step === ModalStep.STREAMING && (
                        <StepStreamings
                            streamings={streamings}
                            selectedIds={logic.selectedStreamingIds}
                            onToggle={logic.handleToggleStreaming}
                            searchTerm={logic.streamingSearchTerm}
                            onSearchChange={logic.setStreamingSearchTerm}
                            onNext={logic.handleNext}
                        />
                    )}


                    {logic.step === ModalStep.PARTICIPANTS && (
                        <StepParticipants
                            participantes={participantes}
                            selectedIds={logic.selectedParticipanteIds}
                            selectedStreamings={logic.selectedStreamings}
                            participantStreamings={logic.participantStreamings}
                            onToggleStreaming={logic.handleToggleParticipantStreaming}
                            searchTerm={logic.participanteSearchTerm}
                            onSearchChange={logic.setParticipanteSearchTerm}
                            capacityInfo={{
                                isOverloaded: logic.isOverloaded,
                                showWarning: logic.selectedStreamingIds.size > 0
                            }}
                            preSelectedId={preSelectedParticipanteId}
                        />
                    )}

                    {logic.step === ModalStep.SUMMARY && (
                        <StepSummary
                            selectedStreamings={logic.selectedStreamings}
                            participantStreamings={logic.participantStreamings}
                            selectedParticipants={Array.from(logic.selectedParticipanteIds).map(id => {
                                const original = participantes.find(p => p.id === id);
                                const set = logic.participantStreamings.get(id);
                                return original ? { ...original, quantidade: set ? set.size : 0 } : null;
                            }).filter(Boolean) as ParticipanteOption[]}
                            configurations={logic.configurations}
                            dataInicio={logic.dataInicio}
                            onDataInicioChange={logic.setDataInicio}
                            cobrancaAutomatica={logic.cobrancaAutomaticaPaga}
                            onCobrancaChange={logic.setCobrancaAutomaticaPaga}
                            primeiroCicloPago={logic.primeiroCicloJaPago}
                            onPrimeiroCicloChange={logic.setPrimeiroCicloJaPago}
                            overloadedStreamings={logic.streamingsSemVagas}
                            financialAnalysis={logic.financialAnalysis}
                            diasVencimento={diasVencimento}
                            onUpdateConfig={logic.handleUpdateConfig}
                            retroactivePaidPeriods={logic.retroactivePaidPeriods}
                            onRetroactivePaidPeriodsChange={logic.setRetroactivePaidPeriods}
                        />
                    )}
                </div>
            </div>
            {renderFooter()}
        </div>
    );
}
