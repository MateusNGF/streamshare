"use client";

import { useEffect, useState } from "react";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { useToast } from "@/hooks/useToast";

interface GoogleAuthButtonProps {
    callbackUrl: string;
    mode: "login" | "signup";
    onLoading?: (isLoading: boolean) => void;
    onCredential?: (credential: string) => void;
}

export function GoogleAuthButton({ callbackUrl, mode, onLoading, onCredential }: GoogleAuthButtonProps) {
    const toast = useToast();
    const containerId = `google-${mode}-btn`;

    const { isGoogleLoading, renderGoogleButton } = useGoogleLogin({
        callbackUrl,
        onCredential,
        onSuccess: () => {
            const message = mode === "login" ? "Login realizado com sucesso!" : "Conta criada com sucesso!";
            toast.success(message);
        },
        onError: (err) => {
            toast.error(err);
        }
    });

    useEffect(() => {
        if (onLoading) onLoading(isGoogleLoading);
    }, [isGoogleLoading, onLoading]);

    useEffect(() => {
        renderGoogleButton(containerId);
    }, [renderGoogleButton, containerId]);

    return (
        <div className="relative w-full">
            <div id={containerId} className="w-full h-[58px]" />

            {isGoogleLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20">
                    <div className="flex items-center gap-3 text-primary font-medium">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>{mode === "login" ? "Autenticando..." : "Criando conta..."}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
