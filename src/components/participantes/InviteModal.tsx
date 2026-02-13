"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { validateEmail, ValidationMessages } from "@/lib/validation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (data: { email: string; streamingId?: number }) => Promise<void>;
    loading?: boolean;
    streamings: Array<{
        id: number;
        apelido: string | null;
        catalogo: { nome: string };
    }>;
}

export function InviteModal({
    isOpen,
    onClose,
    onInvite,
    loading,
    streamings
}: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [streamingId, setStreamingId] = useState<string>("none");
    const [error, setError] = useState<string | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError(ValidationMessages.email.required);
            return;
        }

        if (!validateEmail(email)) {
            setError(ValidationMessages.email.invalid);
            return;
        }

        await onInvite({
            email,
            streamingId: streamingId !== "none" ? parseInt(streamingId) : undefined
        });

        setEmail("");
        setStreamingId("none");
        setError(undefined);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Convidar Membro"
            footer={
                <div className="flex w-full gap-3 sm:w-auto">
                    <button
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all justify-center"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading ? "Processando..." : "Enviar Convite"}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                <Input
                    label="Email do Convidado"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError(undefined);
                    }}
                    placeholder="ex: joao@email.com"
                    error={error}
                    required
                />

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
                            {streamings.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.apelido ? `${s.apelido} (${s.catalogo.nome})` : s.catalogo.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 ml-1">
                        O usuário será automaticamente inscrito ao aceitar.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
