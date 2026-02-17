"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import { generateStreamingShareLink, getStreamingLinksHistory, revokeStreamingLink } from "@/actions/streamings";

export function useShareLink() {
    const [expiration, setExpiration] = useState("1h");
    const [generatedLink, setGeneratedLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { success, error } = useToast();

    const fetchHistory = async (streamingId: number) => {
        if (!streamingId) return;
        setLoadingHistory(true);
        try {
            const data = await getStreamingLinksHistory(streamingId);
            setHistory(data);
        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGenerate = async (streamingId: number) => {
        if (!streamingId) {
            error("Selecione um streaming para gerar o link");
            return;
        }

        startTransition(async () => {
            try {
                const token = await generateStreamingShareLink(streamingId, expiration);
                const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
                const url = `${baseUrl}/assinar/${token}`;
                setGeneratedLink(url);

                // Auto copy
                navigator.clipboard.writeText(url);
                setCopied(true);
                success("Link copiado para a área de transferência!");
                fetchHistory(streamingId); // Refresh history
            } catch (err: any) {
                error(err.message || "Erro ao gerar link");
            }
        });
    };

    const handleRevoke = async (inviteId: string, streamingId: number) => {
        startTransition(async () => {
            try {
                await revokeStreamingLink(inviteId);
                success("Link revogado com sucesso");
                fetchHistory(streamingId);
            } catch (err: any) {
                error(err.message || "Erro ao revogar link");
            }
        });
    };

    const resetLinkState = () => {
        setGeneratedLink("");
        setCopied(false);
        setHistory([]);
    };

    return {
        expiration,
        setExpiration,
        generatedLink,
        setGeneratedLink,
        copied,
        setCopied,
        isPending,
        handleGenerate,
        handleRevoke,
        fetchHistory,
        history,
        loadingHistory,
        resetLinkState
    };
}
