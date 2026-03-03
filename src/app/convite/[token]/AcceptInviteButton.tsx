"use client";

import { useTransition } from "react";
import { acceptInvite } from "@/actions/invites";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

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
                <div className="text-left space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu WhatsApp (Obrigatório)</label>
                    <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full h-16 rounded-2xl border-gray-100 bg-white shadow-sm hover:border-primary/20 transition-all px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-gray-400 ml-1 italic">Necessário para comunicação direta com o host.</p>
                </div>
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
