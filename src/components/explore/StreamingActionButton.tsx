"use client";

import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useTransition } from "react";
import { requestParticipation } from "@/actions/requests";
import { useToast } from "@/hooks/useToast";

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
    const toast = useToast();

    const handleRequest = () => {
        startTransition(async () => {
            try {
                await requestParticipation(streamingId);
                toast.success("Solicitação enviada com sucesso! Aguarde aprovação.");
            } catch (error: any) {
                toast.error(error.message || "Erro ao solicitar participação");
            }
        });
    };

    const isDisabled = isPending || vagasDisponiveis === 0 || !!userStatus || isOwner;

    // Helper to determine button content
    const getButtonContent = () => {
        if (isPending) {
            return (
                <>
                    <Spinner size="sm" color="white" />
                    Processando...
                </>
            );
        }

        if (isOwner) return "Seu Streaming";

        switch (userStatus) {
            case 'participando': return "Participando";
            case 'solicitado': return "Solicitação Pendente";
            case 'recusado': return "Solicitação Rejeitada";
            case 'convidado': return "Convite Pendente";
            default:
                if (vagasDisponiveis > 0) {
                    return (
                        <>
                            Solicitar Vaga
                            <ArrowRight size={18} />
                        </>
                    );
                }
                return "Sem Vagas";
        }
    };

    // Helper for classes
    const getButtonClasses = () => {
        const baseClasses = "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all disabled:opacity-70";

        if (!userStatus && !isOwner && vagasDisponiveis > 0) {
            return `${baseClasses} bg-primary text-white shadow-lg shadow-primary/25 hover:bg-accent hover:-translate-y-0.5 active:translate-y-0`;
        }

        return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    };

    return (
        <button
            onClick={handleRequest}
            disabled={isDisabled}
            className={getButtonClasses()}
        >
            {getButtonContent()}
        </button>
    );
}
