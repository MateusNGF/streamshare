"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { validatePassword } from "@/lib/password-validation";

interface ChangePasswordModalProps {
    isOpen: boolean;
    user: {
        hasPassword?: boolean;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function ChangePasswordModal({ isOpen, user, onClose, onSuccess }: ChangePasswordModalProps) {
    const hasPassword = user?.hasPassword ?? true;
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validações client-side
        if (hasPassword && !currentPassword) {
            setError("Digite sua senha atual");
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || "Senha inválida");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        if (hasPassword && currentPassword === newPassword) {
            setError("A nova senha deve ser diferente da senha atual");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao alterar senha");
            }

            // Limpar formulário
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Chamar callback de sucesso
            onSuccess();

            // Fechar modal
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={hasPassword ? "Alterar Senha" : "Definir Senha"}
            footer={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="w-full sm:w-auto sm:mr-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="default"
                        type="submit"
                        form="change-password-form"
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading
                            ? (hasPassword ? "Alterando..." : "Definindo...")
                            : (hasPassword ? "Alterar Senha" : "Definir Senha")}
                    </Button>
                </div>
            }
        >
            <form id="change-password-form" onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {!hasPassword && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-xs border border-blue-100 flex gap-3">
                        <Lock size={16} className="shrink-0" />
                        <p>
                            Como você entrou via Google, você ainda não tem uma senha.
                            Defina uma agora para poder desvincular o Google ou logar tradicionalmente.
                        </p>
                    </div>
                )}

                {hasPassword && (
                    <PasswordInput
                        label="Senha Atual"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        required
                    />
                )}

                <PasswordInput
                    label={hasPassword ? "Nova Senha" : "Senha"}
                    value={newPassword}
                    onChange={setNewPassword}
                    required
                    showRequirements
                    showStrength
                />

                <PasswordInput
                    label="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                />
            </form>
        </Modal>
    );
}
