"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import { generateStreamingShareLink, getStreamingLinksHistory, revokeStreamingLink } from "@/actions/streamings";
import { generateAccountShareLink, getAccountLinksHistory, revokeAccountLink } from "@/actions/invites";


// --- Strategy Handlers for Clean Code / SOLID (OCP, SRP) ---

type LinkActionResponse<T> = { success: boolean; data?: T; error?: any };

interface ShareLinkStrategy {
    fetchHistory(id: number | string): Promise<LinkActionResponse<any[]>>;
    generateLink(id: number | string, expiration: string, singleUse: boolean): Promise<LinkActionResponse<string>>;
    revokeLink(inviteId: string, id: number | string): Promise<LinkActionResponse<void>>;
    buildUrl(baseUrl: string, token: string): string;
}

const accountShareStrategy: ShareLinkStrategy = {
    fetchHistory: () => getAccountLinksHistory(),
    generateLink: (_, expiration, singleUse) => generateAccountShareLink(expiration, singleUse),
    revokeLink: (inviteId, _) => revokeAccountLink(inviteId),
    buildUrl: (baseUrl, token) => `${baseUrl}/convite/${token}`,
};

const streamingShareStrategy: ShareLinkStrategy = {
    fetchHistory: (id) => getStreamingLinksHistory(typeof id === "string" ? parseInt(id) : id),
    generateLink: (id, expiration, singleUse) => generateStreamingShareLink(typeof id === "string" ? parseInt(id) : id, expiration, singleUse),
    revokeLink: (inviteId, _) => revokeStreamingLink(inviteId),
    buildUrl: (baseUrl, token) => `${baseUrl}/assinar/${token}`,
};

function getStrategy(streamingId: number | string): ShareLinkStrategy {
    return streamingId === "none" ? accountShareStrategy : streamingShareStrategy;
}

// --- Main Hook ---

export function useShareLink() {
    const [expiration, setExpiration] = useState("1h");
    const [singleUse, setSingleUse] = useState(true);
    const [generatedLink, setGeneratedLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { success, error } = useToast();

    const fetchHistory = async (streamingId: number | string) => {
        if (!streamingId) return;
        setLoadingHistory(true);
        try {
            const strategy = getStrategy(streamingId);
            const result = await strategy.fetchHistory(streamingId);

            if (result.success && 'data' in result && result.data) {
                setHistory(result.data);
            } else if (!result.success && 'error' in result && result.error) {
                error(result.error);
            }
        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
            error("Erro ao buscar histórico");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGenerate = async (streamingId: number | string) => {
        if (!streamingId) {
            error("Selecione uma opção válida para gerar o link");
            return;
        }

        startTransition(async () => {
            try {
                const strategy = getStrategy(streamingId);
                const result = await strategy.generateLink(streamingId, expiration, singleUse);

                if (result.success && 'data' in result && result.data) {
                    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
                    const url = strategy.buildUrl(baseUrl, result.data);

                    setGeneratedLink(url);

                    // Auto copy
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    success("Link copiado para a área de transferência!");
                    fetchHistory(streamingId); // Refresh history
                } else if (!result.success && 'error' in result && result.error) {
                    error(result.error);
                }
            } catch (err: any) {
                error(err.message || "Erro ao gerar link");
            }
        });
    };

    const handleRevoke = async (inviteId: string, streamingId: number | string) => {
        startTransition(async () => {
            try {
                const strategy = getStrategy(streamingId);
                const result = await strategy.revokeLink(inviteId, streamingId);

                if (result.success) {
                    success("Link revogado com sucesso");
                    fetchHistory(streamingId);
                } else if (!result.success && 'error' in result && result.error) {
                    error(result.error);
                }
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
        singleUse,
        setSingleUse,
        handleGenerate,
        handleRevoke,
        fetchHistory,
        history,
        loadingHistory,
        resetLinkState
    };
}
