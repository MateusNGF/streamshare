import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        google: any;
    }
}

interface UseGoogleLoginProps {
    callbackUrl: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onCredential?: (credential: string) => void;
}

export function useGoogleLogin({ callbackUrl, onSuccess, onError, onCredential }: UseGoogleLoginProps) {
    const router = useRouter();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);

    const handleGoogleResponse = useCallback(async (response: any) => {
        const credential = response.credential;
        console.log("Google response received...");

        if (onCredential) {
            onCredential(credential);
            return;
        }

        setIsGoogleLoading(true);
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: credential }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Google authentication failed:", data.error);
                throw new Error(data.error || "Erro ao autenticar com Google");
            }

            console.log("Google authentication successful, redirecting...");
            if (onSuccess) onSuccess();
            router.push(callbackUrl);
            router.refresh();
        } catch (err: any) {
            console.error("Google login error hook:", err.message);
            if (onError) onError(err.message);
        } finally {
            setIsGoogleLoading(false);
        }
    }, [callbackUrl, router, onSuccess, onError, onCredential]);

    const initializeGoogle = useCallback(() => {
        if (!window.google) return;

        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            console.error("Google Client ID is missing! Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set in your environment variables.");
            return;
        }

        console.log("Initializing Google Identity Services...");
        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        // One Tap prompt (optional, but nice)
        window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log("One Tap not displayed or skipped", notification.getNotDisplayedReason());
            }
        });

        setIsSdkLoaded(true);
    }, [handleGoogleResponse]);

    useEffect(() => {
        // Wait for script to load if it's not already there
        if (window.google) {
            initializeGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    initializeGoogle();
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [initializeGoogle]);

    const renderGoogleButton = useCallback((containerId: string) => {
        if (!window.google) {
            console.warn("Cannot render Google button: SDK not loaded yet");
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return;
        }

        window.google.accounts.id.renderButton(
            container,
            {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "continue_with",
                shape: "pill",
                locale: "pt_BR"
            }
        );
    }, []);

    return {
        isGoogleLoading,
        isSdkLoaded,
        renderGoogleButton
    };
}
