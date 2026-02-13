"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Chrome } from "lucide-react";

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ general?: string; confirmPassword?: string; acceptTerms?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "As senhas não coincidem!" });
            return;
        }

        if (!acceptTerms) {
            setErrors({ acceptTerms: "Você deve aceitar os termos e condições!" });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao criar conta");
            }

            // Redirect to dashboard
            // Redirect to checkout if plan is selected, otherwise dashboard
            if (plan) {
                router.push(`/checkout/start?plan=${plan}`);
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        } catch (err: any) {
            setErrors({ general: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {errors.general}
                </div>
            )}

            <div className="space-y-4">
                <Input
                    label="Nome completo"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João Silva"
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                <PasswordInput
                    label="Senha"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    placeholder="Sua senha secreta"
                    required
                    showStrength
                />
                <PasswordInput
                    label="Confirmar senha"
                    value={confirmPassword}
                    onChange={(value) => setConfirmPassword(value)}
                    placeholder="Confirme sua senha"
                    required
                    error={errors.confirmPassword}
                />
            </div>

            <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="peer sr-only"
                            required
                        />
                        <div className={`w-5 h-5 border-2 rounded-md transition-all ${errors.acceptTerms ? "border-red-500" : "border-gray-300 peer-checked:bg-primary peer-checked:border-primary"}`} />
                        <svg
                            className="absolute left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors leading-tight">
                        Eu aceito os{" "}
                        <Link href="/termos-de-uso" target="_blank" className="font-semibold text-primary hover:text-primary/80">
                            termos e condições
                        </Link>{" "}
                        e a{" "}
                        <Link href="/politica-de-privacidade" target="_blank" className="font-semibold text-primary hover:text-primary/80">
                            política de privacidade
                        </Link>
                    </span>
                </label>
                {errors.acceptTerms && (
                    <p className="text-xs text-red-500 font-medium ml-8">{errors.acceptTerms}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
            >
                {loading ? "Criando conta..." : "Criar minha conta"}
            </Button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">ou cadastre-se com</span>
                </div>
            </div>

            <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 py-4 rounded-2xl font-bold transition-all duration-300 group"
            >
                <Chrome size={20} className="text-gray-500 group-hover:text-primary transition-colors" />
                <span>Google</span>
            </button>
        </form>
    );
}
