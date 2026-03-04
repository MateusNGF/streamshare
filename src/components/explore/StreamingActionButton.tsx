"use client";

import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useTransition, useOptimistic } from "react";
import { requestParticipation } from "@/actions/requests";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export type UserStreamingStatus = 'participando' | 'solicitado' | 'convidado' | 'recusado' | null;

interface StreamingActionButtonProps {
    streamingId: number;
    vagasDisponiveis: number;
    isOwner?: boolean;
    userStatus?: UserStreamingStatus;
}

export function StreamingActionButton({
    streamingId,
    vagasDisponiveis,
    isOwner,
    userStatus
}: StreamingActionButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, addOptimisticStatus] = useOptimistic<UserStreamingStatus, UserStreamingStatus>(
        userStatus || null,
        (_, newStatus) => newStatus
    );
    const toast = useToast();

    const handleRequest = () => {
        startTransition(async () => {
            addOptimisticStatus('solicitado');
            try {
                const result = await requestParticipation(streamingId);
                if (result.success) {
                    if ('isAutoApproved' in result && result.isAutoApproved) {
                        addOptimisticStatus('participando');
                        toast.success("Entrada confirmada! Você já faz parte do streaming.");
                    } else {
                        toast.success("Solicitação enviada com sucesso! Aguarde aprovação.");
                    }
                } else {
                    // Type guard for error property
                    const errorMsg = 'error' in result ? result.error : "Erro ao solicitar participação";
                    toast.error(errorMsg);
                }
            } catch (error: any) {
                toast.error(error.message || "Erro ao solicitar participação");
            }
        });
    };

    const isActionDisabled = isPending || vagasDisponiveis === 0 || !!optimisticStatus || isOwner;

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleRequest}
                disabled={isActionDisabled}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all disabled:opacity-70",
                    !optimisticStatus && !isOwner && vagasDisponiveis > 0
                        ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
            >
                <ButtonContent
                    isOwner={isOwner}
                    status={optimisticStatus}
                    vagas={vagasDisponiveis}
                    isPending={isPending}
                />
            </button>

            {optimisticStatus === 'solicitado' && (
                <p className="text-[10px] text-gray-400 text-center font-medium animate-pulse">
                    O Organizador tem até 48h para responder, caso contrário a solicitação será cancelada.
                </p>
            )}
        </div>
    );
}

function ButtonContent({
    isOwner,
    status,
    vagas,
    isPending
}: {
    isOwner?: boolean;
    status: UserStreamingStatus;
    vagas: number;
    isPending: boolean
}) {
    if (isPending) return <Spinner size="sm" color="white" />;
    if (isOwner) return "Seu Streaming";

    switch (status) {
        case 'participando': return "Participando";
        case 'solicitado': return "Solicitação Pendente";
        case 'recusado': return "Solicitação Rejeitada";
        case 'convidado': return "Convite Pendente";
        default:
            if (vagas > 0) {
                return (
                    <>
                        Solicitar Vaga
                        <ArrowRight size={18} />
                    </>
                );
            }
            return "Sem Vagas";
    }
}
