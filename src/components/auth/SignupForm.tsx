"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Chrome } from "lucide-react";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/config/legal";
import { Checkbox } from "@/components/ui/Checkbox";

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");
    const callbackUrl = searchParams.get("callbackUrl");

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        general?: string;
        confirmPassword?: string;
        acceptTerms?: string;
        acceptPrivacy?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "As senhas não coincidem!" });
            return;
        }

        if (!acceptTerms || !acceptPrivacy) {
            setErrors({
                acceptTerms: !acceptTerms ? "Você deve aceitar os termos e condições!" : undefined,
                acceptPrivacy: !acceptPrivacy ? "Você deve aceitar a política de privacidade!" : undefined
            });
            return;
        }

        setLoading(true);

        try {
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
                throw new Error(data.error || "Erro ao criar conta");
            }

            // Redirect: callbackUrl > plan > dashboard
            if (callbackUrl) {
                router.push(callbackUrl);
            } else if (plan) {
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

            <div className="space-y-4 pt-2">
                <div
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-gray-50/50 relative ${acceptTerms ? "border-primary/20 bg-primary/[0.02]" : "border-gray-100 bg-white"}`}
                >
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="accept-terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="accept-terms" className="text-sm font-semibold text-gray-900 cursor-pointer block">
                            Eu aceito os{" "}
                            <Link
                                href="/termos-de-uso"
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:underline relative z-10"
                            >
                                termos e condições de uso
                            </Link>
                        </label>
                        {errors.acceptTerms && <p className="text-xs text-red-500 mt-1">{errors.acceptTerms}</p>}
                    </div>
                </div>

                <div
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-gray-50/50 relative ${acceptPrivacy ? "border-primary/20 bg-primary/[0.02]" : "border-gray-100 bg-white"}`}
                >
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="accept-privacy"
                            checked={acceptPrivacy}
                            onCheckedChange={(checked: boolean) => setAcceptPrivacy(checked)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="accept-privacy" className="text-sm font-semibold text-gray-900 cursor-pointer block">
                            Eu aceito a{" "}
                            <Link
                                href="/politica-de-privacidade"
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:underline relative z-10"
                            >
                                política de privacidade
                            </Link>
                        </label>
                        {errors.acceptPrivacy && <p className="text-xs text-red-500 mt-1">{errors.acceptPrivacy}</p>}
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading || !acceptTerms || !acceptPrivacy}
                className="w-full text-base py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
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
