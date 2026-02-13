"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
            <div className="space-y-8">
                <div className="bg-green-50 border border-green-100 text-green-800 p-8 rounded-2xl text-center shadow-inner">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
                        ✉️
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-green-900">Email Enviado!</h3>
                    <p className="text-green-700 leading-relaxed">
                        Se o email <strong className="font-semibold text-green-900">{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
                    </p>
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-primary hover:text-accent font-bold py-4 rounded-xl hover:bg-primary/5 transition-all"
                >
                    <ArrowLeft size={20} />
                    Voltar para o login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="hidden md:block text-center mb-6">
                <p className="text-gray-500">
                    Digite seu email cadastrado e enviaremos um link para você redefinir sua senha.
                </p>
            </div>

            {error && (
                <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
            >
                {loading ? "Enviando..." : "Enviar Instruções"}
            </Button>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 font-semibold py-2 transition-colors md:hidden"
            >
                <ChevronLeft size={20} />
                Voltar
            </Link>
        </form>
    );
}
