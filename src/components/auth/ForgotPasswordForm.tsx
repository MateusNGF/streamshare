"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao solicitar reset de senha");
            }

            setSuccess(true);
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
                    <div className="text-4xl mb-3">✉️</div>
                    <h3 className="font-bold text-lg mb-2">Email Enviado!</h3>
                    <p className="text-sm">
                        Se o email <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
                    </p>
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-primary hover:text-accent font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Voltar para o login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-gray-600">
                    Digite seu email e enviaremos instruções para redefinir sua senha.
                </p>
            </div>

            {error && (
                <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
            />

            <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-primary hover:bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
                {loading ? "Enviando..." : "Enviar Instruções"}
            </button>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
                <ArrowLeft size={18} />
                Voltar para o login
            </Link>
        </form>
    );
}
