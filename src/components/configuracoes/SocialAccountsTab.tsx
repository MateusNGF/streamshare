"use client";

import { useState } from "react";
import { Chrome, Unlink, CheckCircle2, AlertCircle } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { linkGoogleAccount, unlinkGoogleAccount } from "@/actions/auth-link";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";

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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Contas Conectadas</h3>
                <p className="text-sm text-gray-500">
                    Gerencie suas conexões com provedores externos. Vincular uma conta permite que você faça login de forma rápida e segura.
                </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                            <Chrome className="text-gray-600" size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Google</p>
                            {isGoogleLinked ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-green-600 text-sm mt-0.5 font-medium">
                                        <CheckCircle2 size={14} />
                                        <span>Conectado</span>
                                    </div>
                                    {!user?.hasPassword && (
                                        <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-xs max-w-sm border border-amber-100">
                                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                            <p>
                                                <strong>Atenção:</strong> Você precisa definir uma senha na aba <strong>Meu Perfil</strong> antes de desvincular o Google, para garantir que não perca o acesso à sua conta.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                                    <AlertCircle size={14} />
                                    <span>Não conectado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-48">
                        {isGoogleLinked ? (
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                                onClick={handleUnlink}
                                disabled={loading}
                            >
                                <Unlink size={16} className="mr-2" />
                                Desvincular
                            </Button>
                        ) : (
                            <div className="relative">
                                {/* We override the callback to call our link function instead of login redirect */}
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
            </div>
        </div>
    );
}
