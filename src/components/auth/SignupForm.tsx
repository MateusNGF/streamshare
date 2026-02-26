"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { useSignupForm } from "@/hooks/useSignupForm";

const GoogleAuthButton = dynamic(() => import("./GoogleAuthButton").then(mod => mod.GoogleAuthButton), {
    loading: () => <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
});

/**
 * SignupForm
 * Main registration form component.
 * Uses useSignupForm hook for state and EmailVerificationModal for OTP.
 */
export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const { state, actions } = useSignupForm();
    const {
        nome, setNome,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        acceptTerms, setAcceptTerms,
        acceptPrivacy, setAcceptPrivacy,
        isLoading,
        errors,
        showVerificationModal, setShowVerificationModal,
        pendingToken
    } = state;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await actions.signup();
    };

    const handleVerificationSuccess = () => {
        // Redirect: callbackUrl > plan > dashboard
        if (callbackUrl) {
            router.push(callbackUrl);
        } else if (plan) {
            router.push(`/checkout/start?plan=${plan}`);
        } else {
            router.push("/dashboard");
        }
        router.refresh();
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {errors.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-smooth"
                />
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-smooth"
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
                {/* Terms Acceptance */}
                <div
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-smooth group cursor-pointer ${acceptTerms ? "border-primary/20 bg-primary/[0.02]" : "border-gray-100 bg-white hover:bg-gray-50/50"
                        }`}
                    onClick={() => setAcceptTerms(!acceptTerms)}
                >
                    <div className="flex items-center h-5 pt-0.5" onClick={(e) => e.stopPropagation()}>
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
                        {errors.acceptTerms && <p className="text-xs text-red-500 mt-1 animate-in fade-in">{errors.acceptTerms}</p>}
                    </div>
                </div>

                {/* Privacy Acceptance */}
                <div
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-smooth group cursor-pointer ${acceptPrivacy ? "border-primary/20 bg-primary/[0.02]" : "border-gray-100 bg-white hover:bg-gray-50/50"
                        }`}
                    onClick={() => setAcceptPrivacy(!acceptPrivacy)}
                >
                    <div className="flex items-center h-5 pt-0.5" onClick={(e) => e.stopPropagation()}>
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
                        {errors.acceptPrivacy && <p className="text-xs text-red-500 mt-1 animate-in fade-in">{errors.acceptPrivacy}</p>}
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isLoading || !acceptTerms || !acceptPrivacy}
                className="w-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
            >
                {isLoading ? "Criando conta..." : "Criar minha conta"}
            </Button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-white px-4 text-gray-400">ou cadastre-se com</span>
                </div>
            </div>

            <GoogleAuthButton callbackUrl={callbackUrl} mode="signup" />

            <EmailVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                email={email}
                onVerified={handleVerificationSuccess}
                pendingToken={pendingToken}
            />
        </form>
    );
}
