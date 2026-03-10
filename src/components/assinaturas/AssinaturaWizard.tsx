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
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { createAssinatura, createBulkAssinaturas } from "@/actions/assinaturas";
import { useState, useEffect } from "react";
import { getAccountDiasVencimento } from "@/actions/settings";

interface AssinaturaWizardProps {
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
}

export function AssinaturaWizard({ participantes, streamings }: AssinaturaWizardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [diasVencimento, setDiasVencimento] = useState<number[]>([]);

    const preSelectedParticipanteId = searchParams.get("participanteId") || undefined;
    const preSelectedStreamingId = searchParams.get("streamingId") || undefined;

    useEffect(() => {
        getAccountDiasVencimento().then(res => {
            if (res.success && res.data) setDiasVencimento(res.data);
        }).catch(() => { });
    }, []);


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
                onClick={() => router.push("/assinaturas")}
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
                            preSelectedId={preSelectedParticipanteId}
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
