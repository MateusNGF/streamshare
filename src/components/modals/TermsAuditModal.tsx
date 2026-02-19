"use client";

import { Modal } from "@/components/ui/Modal";
import { ScrollText, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { acceptTerms, acceptPrivacy } from "@/actions/legal";
import { CURRENT_TERMS_VERSION, LAST_TERMS_UPDATED_DATE, CURRENT_PRIVACY_VERSION } from "@/config/legal";
import { useToast } from "@/contexts/ToastContext";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

interface TermsAuditModalProps {
    isOpen: boolean;
    needsTerms: boolean;
    needsPrivacy: boolean;
}

export function TermsAuditModal({ isOpen, needsTerms, needsPrivacy }: TermsAuditModalProps) {
    const { showToast } = useToast();
    const [acceptedTerms, setAcceptedTerms] = useState(!needsTerms);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(!needsPrivacy);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        if ((needsTerms && !acceptedTerms) || (needsPrivacy && !acceptedPrivacy)) return;
        setLoading(true);
        try {
            if (needsTerms) {
                const result = await acceptTerms(CURRENT_TERMS_VERSION);
                if (!result.success) {
                    showToast("error", result.error || "Erro ao aceitar termos");
                    setLoading(false);
                    return;
                }
            }

            if (needsPrivacy) {
                const result = await acceptPrivacy(CURRENT_PRIVACY_VERSION);
                if (!result.success) {
                    showToast("error", result.error || "Erro ao aceitar política de privacidade");
                    setLoading(false);
                    return;
                }
            }

            showToast("success", "Políticas aceitas com sucesso!");
            window.location.reload();
        } catch (error) {
            showToast("error", "Ocorreu um erro inesperado");
        } finally {
            setLoading(false);
        }
    };

    // Use a dummy onClose because this modal is mandatory
    const noop = () => { };

    return (
        <Modal
            isOpen={isOpen}
            onClose={noop}
            title="Atualização dos Termos de Uso"
            className="sm:max-w-xl"
            footer={
                <Button
                    onClick={handleAccept}
                    disabled={(needsTerms && !acceptedTerms) || (needsPrivacy && !acceptedPrivacy) || loading}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Processando..." : "Confirmar e Continuar"}
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <ScrollText className="text-primary" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Atualizamos nossos Termos de Uso e Política de Privacidade
                    </h3>
                    <p className="text-gray-500 mt-2">
                        Para continuar utilizando o StreamShare, você precisa ler e concordar com a nova versão dos nossos termos (v{CURRENT_TERMS_VERSION}), atualizada em {LAST_TERMS_UPDATED_DATE}.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Implementamos melhorias importantes na nossa transparência e segurança de dados, incluindo novos mecanismos de auditoria de consentimento conforme exigido pela LGPD.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/termos-de-uso"
                            target="_blank"
                            className="text-primary font-semibold text-sm flex items-center gap-2 hover:underline w-fit"
                        >
                            <ExternalLink size={14} />
                            Ler Termos de Uso atualizados
                        </Link>
                        <Link
                            href="/politica-de-privacidade"
                            target="_blank"
                            className="text-primary font-semibold text-sm flex items-center gap-2 hover:underline w-fit"
                        >
                            <ExternalLink size={14} />
                            Ler Política de Privacidade atualizada
                        </Link>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    {needsTerms && (
                        <div
                            onClick={() => setAcceptedTerms(!acceptedTerms)}
                            className={cn(
                                "flex items-start gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-gray-50",
                                acceptedTerms
                                    ? "border-primary/20 bg-primary/[0.02]"
                                    : "border-gray-100 bg-white"
                            )}
                        >
                            <div className="flex items-center pt-1">
                                <Switch
                                    checked={acceptedTerms}
                                    onCheckedChange={setAcceptedTerms}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                    Eu li e aceito os Termos de Uso
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                    Você confirma que leu integralmente os termos de uso e concorda com as diretrizes de serviço.
                                </p>
                            </div>
                        </div>
                    )}

                    {needsPrivacy && (
                        <div
                            onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                            className={cn(
                                "flex items-start gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-gray-50",
                                acceptedPrivacy
                                    ? "border-primary/20 bg-primary/[0.02]"
                                    : "border-gray-100 bg-white"
                            )}
                        >
                            <div className="flex items-center pt-1">
                                <Switch
                                    checked={acceptedPrivacy}
                                    onCheckedChange={setAcceptedPrivacy}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                    Eu li e aceito a Política de Privacidade
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                    Você confirma o aceite do processamento de seus dados pessoais conforme a LGPD.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
