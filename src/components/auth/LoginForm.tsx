"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Chrome } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function LoginForm() {
    const router = useRouter();
    const toast = useToast();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao fazer login");
            }

            // Redirect to callbackUrl or dashboard
            router.push(callbackUrl);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <PasswordInput
                    label="Senha"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    placeholder="Sua senha secreta"
                    required
                />
            </div>

            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
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
                    <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Lembrar-me</span>
                </label>
                <Link
                    href="/esqueci-senha"
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                    Esqueci minha senha
                </Link>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
            >
                {loading ? "Entrando..." : "Entrar na conta"}
            </Button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">ou continue com</span>
                </div>
            </div>

            <GoogleAuthButton callbackUrl={callbackUrl} mode="login" />
        </form>
    );
}
