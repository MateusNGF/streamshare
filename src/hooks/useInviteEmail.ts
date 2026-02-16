"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import { inviteUser } from "@/actions/invites";
import { validateEmail, ValidationMessages } from "@/lib/validation";

interface UseInviteEmailProps {
    onSuccess: () => void;
}

export function useInviteEmail({ onSuccess }: UseInviteEmailProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();
    const { success, error } = useToast();

    const handleInvite = async (streamingId?: number) => {
        if (!email.trim()) {
            setEmailError(ValidationMessages.email.required);
            return;
        }
        if (!validateEmail(email)) {
            setEmailError(ValidationMessages.email.invalid);
            return;
        }

        startTransition(async () => {
            try {
                await inviteUser({
                    email,
                    streamingId
                });
                success("Convite enviado com sucesso!");
                onSuccess();
            } catch (err: any) {
                error(err.message || "Erro ao enviar convite");
            }
        });
    };

    const resetEmailState = () => {
        setEmail("");
        setEmailError(undefined);
    };

    return {
        email,
        setEmail,
        emailError,
        isPending,
        handleInvite,
        resetEmailState
    };
}
