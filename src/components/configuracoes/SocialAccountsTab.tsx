"use client";

import { useState } from "react";
import { Chrome, Unlink, CheckCircle2, AlertCircle } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { linkGoogleAccount, unlinkGoogleAccount } from "@/actions/auth-link";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface SocialAccountsTabProps {
    user: {
        email: string;
        provider: string;
        hasPassword?: boolean;
    } | null;
}

export function SocialAccountsTab({ user }: SocialAccountsTabProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const isGoogleLinked = user?.provider === "google";

    const handleLink = async (idToken: string) => {
        setLoading(true);
        try {
            const result = await linkGoogleAccount(idToken);
            if (result.success) {
                toast.success(result.message!);
            } else {
                toast.error(result.error!);
            }
        } catch (error) {
            toast.error("Erro ao vincular conta");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async () => {
        if (!confirm("Tem certeza que deseja desvincular sua conta do Google?")) return;

        setLoading(true);
        try {
            const result = await unlinkGoogleAccount();
            if (result.success) {
                toast.success(result.message!);
            } else {
                toast.error(result.error!);
            }
        } catch (error) {
            toast.error("Erro ao desvincular conta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader
                title="Contas Conectadas"
                description="Gerencie suas conexões com provedores externos. Vincular uma conta permite que você faça login de forma rápida e segura."
            />

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                        {/* Informações do Provedor */}
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-inner">
                                <Chrome className="text-gray-600" size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-xl tracking-tight">Google</h4>
                                {isGoogleLinked ? (
                                    <div className="flex items-center gap-1.5 text-green-600 text-sm mt-1 font-semibold">
                                        <CheckCircle2 size={16} />
                                        <span>Conectado</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1 font-medium">
                                        <AlertCircle size={16} />
                                        <span>Não conectado</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="w-full sm:w-auto sm:min-w-[240px]">
                            {isGoogleLinked ? (
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 font-bold transition-all shadow-sm"
                                    onClick={handleUnlink}
                                    disabled={loading}
                                >
                                    <Unlink size={18} className="mr-2" />
                                    Desvincular
                                </Button>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <GoogleAuthButton
                                        callbackUrl="/configuracoes"
                                        mode="login"
                                        onLoading={setLoading}
                                        onCredential={handleLink}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alerta de Senha Necessária */}
                    {isGoogleLinked && !user?.hasPassword && (
                        <div className="mt-8 flex items-start gap-4 p-5 bg-amber-50/40 rounded-3xl border border-amber-100/50 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0">
                                <AlertCircle size={20} className="text-amber-600" />
                            </div>
                            <div className="text-sm">
                                <p className="text-amber-800/80 leading-relaxed font-medium">
                                    <strong>Atenção:</strong> Você precisa definir uma senha na aba <strong>Meu Perfil</strong> antes de desvincular o Google, para garantir que não perca o acesso à sua conta.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Placeholder para futuras integrações */}
            <div className="opacity-40">
                <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <span className="text-gray-400 text-2xl font-bold">+</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Mais integrações em breve</p>
                    <p className="text-xs text-gray-400 mt-1">Estamos expandindo nossas conexões sociais</p>
                </div>
            </div>
        </div>
    );

}

