"use client";

import { useTransition } from "react";
import { acceptInvite } from "@/actions/invites";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";

export function AcceptInviteButton({ token }: { token: string }) {
    const [isPending, startTransition] = useTransition();
    const toast = useToast();
    const router = useRouter();

    const handleAccept = () => {
        startTransition(async () => {
            try {
                await acceptInvite(token);
                toast.success("Convite aceito com sucesso! Bem-vindo.");
                router.push("/dashboard");
            } catch (error: any) {
                toast.error(error.message || "Erro ao aceitar convite");
            }
        });
    };

    return (
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
    );
}
