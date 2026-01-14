"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { validatePassword } from "@/lib/password-validation";
import { CheckCircle2 } from "lucide-react";

interface ResetPasswordFormProps {
    token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validações client-side
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || "Senha inválida");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao redefinir senha");
            }

            setSuccess(true);

            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 text-green-800 p-6 rounded-xl text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold text-lg mb-2">Senha Redefinida!</h3>
                    <p className="text-sm">
                        Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <PasswordInput
                label="Nova Senha"
                value={password}
                onChange={setPassword}
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

            <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-primary hover:bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
        </form>
    );
}
