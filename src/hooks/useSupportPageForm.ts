"use client";

import { useState, useTransition, useEffect } from "react";
import { createReport, SuporteInput, getCurrentUserAction } from "@/actions/suporte";
import { useToast } from "@/contexts/ToastContext";

interface UseSupportPageFormProps {
    onSuccess?: () => void;
}

export function useSupportPageForm({ onSuccess }: UseSupportPageFormProps = {}) {
    const [isPending, startTransition] = useTransition();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState<SuporteInput>({
        nome: "",
        email: "",
        assunto: "",
        descricao: "",
    });

    // Loads user data on mount (no isOpen gate needed for a full page)
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
            } catch {
                setIsLoggedIn(false);
            }
        };
        loadUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        startTransition(async () => {
            const result = await createReport(formData);
            if (result.success) {
                showToast("success", "Recebemos sua mensagem e entraremos em contato em breve.");
                setFormData(prev => ({ nome: prev.nome, email: prev.email, assunto: "", descricao: "" }));
                onSuccess?.();
            } else {
                showToast("error", result.error || "Não foi possível enviar seu report. Tente novamente.");
            }
        });
    };

    return { formData, isPending, isLoggedIn, handleChange, handleSubmit };
}
