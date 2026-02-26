"use client";

import { useState } from "react";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/config/legal";

export function useSignupForm() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        general?: string;
        confirmPassword?: string;
        acceptTerms?: string;
        acceptPrivacy?: string;
    }>({});
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [pendingToken, setPendingToken] = useState<string | null>(null);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem!";
        }
        if (!acceptTerms) {
            newErrors.acceptTerms = "Você deve aceitar os termos e condições!";
        }
        if (!acceptPrivacy) {
            newErrors.acceptPrivacy = "Você deve aceitar a política de privacidade!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const signup = async () => {
        if (!validate()) return false;

        setIsLoading(true);
        setErrors({});

        try {
            // 1. Send data to signup API
            // It will validate and send OTP, but NOT create the user yet.
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    email,
                    senha: password,
                    termsAccepted: true,
                    termsVersion: CURRENT_TERMS_VERSION,
                    privacyAccepted: true,
                    privacyVersion: CURRENT_PRIVACY_VERSION
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao iniciar cadastro");
            }

            // Store the pending token for the verification step
            setPendingToken(data.pendingToken);

            // Open verification modal
            setShowVerificationModal(true);
            return true;
        } catch (err: any) {
            setErrors({ general: err.message || "Erro inesperado ao criar conta." });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state: {
            nome, setNome,
            email, setEmail,
            password, setPassword,
            confirmPassword, setConfirmPassword,
            acceptTerms, setAcceptTerms,
            acceptPrivacy, setAcceptPrivacy,
            isLoading,
            errors,
            showVerificationModal, setShowVerificationModal,
            pendingToken
        },
        actions: {
            signup
        }
    };
}
