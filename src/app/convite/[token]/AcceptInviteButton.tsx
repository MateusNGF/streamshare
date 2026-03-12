"use client";

import { useTransition } from "react";
import { acceptInvite } from "@/actions/invites";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PhoneInput } from "@/components/ui/PhoneInput";

export function AcceptInviteButton({ token, hasWhatsApp }: { token: string; hasWhatsApp: boolean }) {
    const [whatsapp, setWhatsapp] = useState("");
    const [isPending, startTransition] = useTransition();
    const toast = useToast();
    const router = useRouter();

    const handleAccept = () => {
        if (!hasWhatsApp && !whatsapp) {
            toast.error("Por favor, informe seu WhatsApp para continuar.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await acceptInvite(token, whatsapp);
                if (result.success) {
                    toast.success("Convite aceito com sucesso! Bem-vindo.");
                    router.push("/dashboard");
                    router.refresh();
                } else {
                    toast.error(result.error || "Erro ao aceitar convite");
                }
            } catch (error: any) {
                toast.error(error.message || "Erro ao aceitar convite");
            }
        });
    };

    return (
        <div className="space-y-4">
            {!hasWhatsApp && (
                <PhoneInput
                    label="Seu WhatsApp (Obrigatório)"
                    value={whatsapp}
                    onChange={setWhatsapp}
                    placeholder="(00) 00000-0000"
                    disabled={isPending}
                />
            )}

            <button
                onClick={handleAccept}
                disabled={isPending}
                className="w-full bg-primary hover:bg-accent text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Spinner size="sm" color="white" />
                        Processando...
                    </>
                ) : (
                    <>
                        Aceitar e Entrar
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </div>
    );
}
