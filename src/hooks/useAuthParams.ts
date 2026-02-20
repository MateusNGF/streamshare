import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export type AuthTab = "login" | "signup";

const ALERT_MESSAGES: Record<string, string> = {
    ip_change: "Sua sessão foi encerrada por segurança devido a uma mudança de endereço IP.",
    session_expired: "Sua sessão expirou. Por favor, faça login novamente.",
    logout: "Você saiu da sua conta.",
};

export function useAuthParams() {
    const searchParams = useSearchParams();

    // Core parameters
    const hasPlan = searchParams.get("plan");
    const mode = searchParams.get("mode");
    const reason = searchParams.get("reason");
    const messageParam = searchParams.get("message");
    const callbackUrl = searchParams.get("callbackUrl");

    // Derived states
    const isInviteOrSignContext = callbackUrl?.includes("convite") || callbackUrl?.includes("assinar");
    const alertMessage = messageParam || (reason ? ALERT_MESSAGES[reason] : null);

    // Tab state
    const [activeTab, setActiveTab] = useState<AuthTab>(
        hasPlan || mode === "signup" ? "signup" : "login"
    );

    // Sync tab state if URL changes (e.g. user clicks a link with ?mode=signup)
    useEffect(() => {
        if (hasPlan || mode === "signup") {
            setActiveTab("signup");
        } else if (mode === "login") {
            setActiveTab("login");
        }
    }, [hasPlan, mode]);

    // Derived content texts based on context
    const loginTitle = "Bem-vindo de volta!";
    const loginSubtitle = isInviteOrSignContext
        ? "Acesse para finalizar sua inscrição"
        : "Acesse sua conta para gerenciar assinaturas";

    const signupTitle = "Crie sua conta";
    const signupSubtitle = isInviteOrSignContext
        ? "Cadastre-se para participar"
        : "Comece a economizar com StreamShare hoje";

    return {
        activeTab,
        setActiveTab,
        alertMessage,
        content: {
            login: { title: loginTitle, subtitle: loginSubtitle },
            signup: { title: signupTitle, subtitle: signupSubtitle }
        }
    };
}
