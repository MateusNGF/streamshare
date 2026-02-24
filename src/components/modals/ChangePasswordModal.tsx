"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Lock className="text-primary" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {hasPassword ? "Alterar Senha" : "Definir Senha"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                        aria-label="Fechar"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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

                    {/* Current Password */}
                    {hasPassword && (
                        <PasswordInput
                            label="Senha Atual"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            required
                        />
                    )}

                    {/* New Password */}
                    <PasswordInput
                        label={hasPassword ? "Nova Senha" : "Senha"}
                        value={newPassword}
                        onChange={setNewPassword}
                        required
                        showRequirements
                        showStrength
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                        label="Confirmar Nova Senha"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        required
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                        >
                            {loading ? (hasPassword ? "Alterando..." : "Definindo...") : (hasPassword ? "Alterar Senha" : "Definir Senha")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
