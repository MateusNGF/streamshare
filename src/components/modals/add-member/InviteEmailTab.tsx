"use client";

import { Input } from "@/components/ui/Input";
import { Mail } from "lucide-react";

interface InviteEmailTabProps {
    email: string;
    onEmailChange: (email: string) => void;
    error?: string;
    isLinkedToStreaming: boolean;
}

export function InviteEmailTab({ email, onEmailChange, error, isLinkedToStreaming }: InviteEmailTabProps) {
    return (
        <div className="space-y-6 pt-2">
            <Input
                label="E-mail do Convidado"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="ex: joao@email.com"
                error={error}
                required
            />
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700">
                <Mail className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm leading-relaxed">
                    O convidado receberá um e-mail com instruções para entrar na sua conta {isLinkedToStreaming ? "e acessar o streaming selecionado." : "."}
                </p>
            </div>
        </div>
    );
}
