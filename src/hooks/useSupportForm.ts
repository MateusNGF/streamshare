"use client";

import { useState, useTransition, useEffect } from "react";
import { createReport, SuporteInput, getCurrentUserAction } from "@/actions/suporte";
import { useToast } from "@/contexts/ToastContext";

interface UseSupportFormProps {
    onSuccess?: () => void;
    isOpen: boolean;
}

export function useSupportForm({ onSuccess, isOpen }: UseSupportFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState<SuporteInput>({
        nome: "",
        email: "",
        assunto: "",
        descricao: "",
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const result = await getCurrentUserAction();
                if (result.success && result.data) {
                    setIsLoggedIn(true);
                    setFormData(prev => ({
                        ...prev,
                        nome: result.data.nome || "",
                        email: result.data.email || "",
                        usuarioId: result.data.id
                    }));
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setIsLoggedIn(false);
            }
        };

        if (isOpen) {
            loadUser();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        startTransition(async () => {
            const result = await createReport(formData);
            if (result.success) {
                showToast(
                    "success",
                    "Recebemos sua mensagem e entraremos em contato em breve."
                );
                setFormData({ nome: "", email: "", assunto: "", descricao: "" });
                onSuccess?.();
            } else {
                showToast(
                    "error",
                    result.error || "Não foi possível enviar seu report. Tente novamente."
                );
            }
        });
    };

    return {
        formData,
        isPending,
        isLoggedIn,
        handleChange,
        handleSubmit,
        setIsLoggedIn
    };
}
