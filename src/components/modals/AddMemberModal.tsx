"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Mail, Link } from "lucide-react";

// Sub-components & Hooks
import { InviteEmailTab } from "./add-member/InviteEmailTab";
import { ShareLinkTab } from "./add-member/ShareLinkTab";
import { useInviteEmail } from "@/hooks/useInviteEmail";
import { useShareLink } from "@/hooks/useShareLink";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    streamings: Array<{
        id: number;
        apelido: string | null;
        catalogo: { nome: string };
    }>;
    initialStreamingId?: number;
    initialTab?: "email" | "link";
}

export function AddMemberModal({
    isOpen,
    onClose,
    streamings,
    initialStreamingId,
    initialTab = "email"
}: AddMemberModalProps) {
    const [activeTab, setActiveTab] = useState<"email" | "link">(initialTab);
    const [streamingId, setStreamingId] = useState<string>(initialStreamingId?.toString() || "none");

    // Logic Hooks
    const emailInvite = useInviteEmail({ onSuccess: handleClose });
    const shareLink = useShareLink();

    // Fetch history when modal opens or streaming changes
    useEffect(() => {
        if (isOpen && streamingId !== "none" && activeTab === "link") {
            shareLink.fetchHistory(parseInt(streamingId));
        }
    }, [isOpen, streamingId, activeTab]);

    function handleClose() {
        onClose();
        setTimeout(() => {
            emailInvite.resetEmailState();
            shareLink.resetLinkState();
            setStreamingId(initialStreamingId?.toString() || "none");
            setActiveTab(initialTab);
        }, 300);
    }

    const currentStreaming = streamings.find(s => s.id.toString() === streamingId);
    const streamingName = currentStreaming?.apelido || currentStreaming?.catalogo.nome;

    const tabs: TabItem[] = [
        {
            id: "email",
            label: "Via E-mail",
            icon: Mail,
            content: (
                <InviteEmailTab
                    email={emailInvite.email}
                    onEmailChange={emailInvite.setEmail}
                    error={emailInvite.emailError}
                    isLinkedToStreaming={streamingId !== "none"}
                />
            )
        },
        {
            id: "link",
            label: "Via Link Público",
            icon: Link,
            content: (
                <ShareLinkTab
                    generatedLink={shareLink.generatedLink}
                    expiration={shareLink.expiration}
                    onExpirationChange={shareLink.setExpiration}
                    copied={shareLink.copied}
                    onCopy={() => {
                        navigator.clipboard.writeText(shareLink.generatedLink);
                        shareLink.setCopied(true);
                    }}
                    history={shareLink.history}
                    loadingHistory={shareLink.loadingHistory}
                    onRevoke={(id) => shareLink.handleRevoke(id, parseInt(streamingId))}
                    isPending={shareLink.isPending}
                />
            )
        }
    ];

    const isPending = emailInvite.isPending || shareLink.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={shareLink.generatedLink ? "Compartilhar Link" : "Adicionar Novo Membro"}
            footer={
                <div className="flex w-full gap-3 sm:w-auto">
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        {shareLink.generatedLink ? "Fechar" : "Cancelar"}
                    </Button>

                    {!shareLink.generatedLink && (
                        <Button
                            onClick={() => {
                                if (activeTab === "email") {
                                    emailInvite.handleInvite(streamingId !== "none" ? parseInt(streamingId) : undefined);
                                } else {
                                    shareLink.handleGenerate(parseInt(streamingId));
                                }
                            }}
                            disabled={isPending}
                            className="min-w-[140px]"
                        >
                            {isPending && <Spinner size="sm" color="white" className="mr-2" />}
                            {activeTab === "email" ? "Enviar Convite" : "Gerar Link"}
                        </Button>
                    )}

                    {shareLink.generatedLink && (
                        <Button onClick={() => shareLink.setGeneratedLink("")} variant="secondary">
                            Gerar Novo
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {!shareLink.generatedLink && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">
                                Vincular a um Streaming (Opcional)
                            </label>
                            <Select value={streamingId} onValueChange={setStreamingId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um streaming" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Apenas convite para a conta</SelectItem>
                                    {streamings.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {(s.apelido ? `${s.apelido} (${s.catalogo.nome})` : s.catalogo.nome).slice(0, 35)}
                                            {(s.apelido || s.catalogo.nome).length > 35 && "..."}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {streamingId !== "none" && (
                                <p className="text-xs text-gray-500 ml-1">
                                    O usuário será vinculado ao streaming <strong>{streamingName}</strong>.
                                </p>
                            )}
                        </div>

                        <Tabs
                            tabs={tabs}
                            value={activeTab}
                            onValueChange={(val) => setActiveTab(val as any)}
                        />
                    </div>
                )}

                {shareLink.generatedLink && !isPending && (
                    <div className="space-y-4">
                        {tabs.find(t => t.id === "link")?.content}
                    </div>
                )}
            </div>
        </Modal>
    );
}
