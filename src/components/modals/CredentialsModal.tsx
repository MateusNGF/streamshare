"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { X, ShieldCheck, Copy, Check, AlertTriangle } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { getSubscriptionCredentials } from "@/actions/dashboard";
import { useToast } from "@/hooks/useToast";

interface CredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscriptionId: number | null;
    streamingName: string;
    streamingLogo: string | null;
    streamingColor: string;
}

export function CredentialsModal({
    isOpen,
    onClose,
    subscriptionId,
    streamingName,
    streamingLogo,
    streamingColor,
}: CredentialsModalProps) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<{ login: string | null; senha: string | null } | null>(null);
    const [isBlurred, setIsBlurred] = useState(false);
    const [copiedField, setCopiedField] = useState<"login" | "senha" | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch credentials on-demand when modal opens
    useEffect(() => {
        if (isOpen && subscriptionId) {
            setLoading(true);
            setCredentials(null);
            getSubscriptionCredentials(subscriptionId)
                .then((res) => {
                    if (res.success && res.data) {
                        setCredentials(res.data);
                    } else {
                        toast.error(res.error || "Erro ao carregar credenciais");
                        onClose();
                    }
                })
                .catch(() => {
                    toast.error("Erro ao carregar credenciais");
                    onClose();
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, subscriptionId]);

    // Anti-screenshot: blur content when tab loses focus or visibility changes
    useEffect(() => {
        if (!isOpen) return;

        const handleVisibilityChange = () => {
            if (document.hidden) setIsBlurred(true);
        };

        const handleBlur = () => setIsBlurred(true);
        const handleFocus = () => setIsBlurred(false);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
        };
    }, [isOpen]);

    // Anti-screenshot: prevent context menu and keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleContextMenu = (e: MouseEvent) => {
            if (contentRef.current?.contains(e.target as Node)) {
                e.preventDefault();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block PrintScreen
            if (e.key === "PrintScreen") {
                e.preventDefault();
                setIsBlurred(true);
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // Escape to close
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        // Lock body scroll
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Clear credentials when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCredentials(null);
            setIsBlurred(false);
            setCopiedField(null);
        }
    }, [isOpen]);

    const handleCopy = useCallback(async (value: string | null, field: "login" | "senha") => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error("Não foi possível copiar");
        }
    }, [toast]);

    const handleClose = useCallback(() => {
        setCredentials(null);
        onClose();
    }, [onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <FocusTrap
                focusTrapOptions={{
                    initialFocus: false,
                    allowOutsideClick: true,
                    escapeDeactivates: false,
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Credenciais de Acesso"
                    className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden
                        animate-slide-in-from-bottom sm:animate-scale-in 
                        [animation-duration:400ms] sm:[animation-duration:300ms]
                        [animation-timing-function:cubic-bezier(0.16,1,0.3,1)] sm:[animation-timing-function:ease-out]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                                <ShieldCheck size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Credenciais de Acesso</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Modo seguro ativo</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            aria-label="Fechar"
                            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-300"
                        >
                            <X size={18} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        ref={contentRef}
                        className="p-5 relative"
                        style={{
                            // Anti-screenshot: CSS filter blur
                            filter: isBlurred ? "blur(20px)" : "none",
                            transition: "filter 0.15s ease",
                        }}
                    >
                        {/* Watermark overlay (anti-screenshot) */}
                        <div
                            className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03]"
                            aria-hidden="true"
                            style={{
                                backgroundImage: `repeating-linear-gradient(
                                    -45deg,
                                    transparent,
                                    transparent 80px,
                                    currentColor 80px,
                                    currentColor 80.5px
                                )`,
                            }}
                        >
                            <div className="flex flex-wrap gap-12 p-4 rotate-[-25deg] scale-150 origin-center">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <span key={i} className="text-[10px] font-black text-gray-900 whitespace-nowrap uppercase tracking-[0.3em]">
                                        CONFIDENCIAL
                                    </span>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span className="text-sm text-gray-400 font-medium">Descriptografando...</span>
                            </div>
                        ) : credentials ? (
                            <div className="space-y-4 relative z-20">
                                {/* Streaming info */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                                    <StreamingLogo
                                        name={streamingName}
                                        iconeUrl={streamingLogo}
                                        color={streamingColor}
                                        size="sm"
                                        rounded="xl"
                                    />
                                    <span className="font-bold text-gray-900">{streamingName}</span>
                                </div>

                                {/* Login field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login</label>
                                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <span
                                            className="text-sm font-bold text-gray-800 select-none"
                                            style={{ WebkitUserSelect: "none", MozUserSelect: "none", userSelect: "none" } as React.CSSProperties}
                                        >
                                            {credentials.login || "—"}
                                        </span>
                                        {credentials.login && (
                                            <button
                                                onClick={() => handleCopy(credentials.login, "login")}
                                                className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-primary active:scale-95"
                                                aria-label="Copiar login"
                                            >
                                                {copiedField === "login" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Senha field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha</label>
                                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <span
                                            className="text-sm font-bold text-gray-800 select-none"
                                            style={{ WebkitUserSelect: "none", MozUserSelect: "none", userSelect: "none" } as React.CSSProperties}
                                        >
                                            {credentials.senha || "—"}
                                        </span>
                                        {credentials.senha && (
                                            <button
                                                onClick={() => handleCopy(credentials.senha, "senha")}
                                                className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-primary active:scale-95"
                                                aria-label="Copiar senha"
                                            >
                                                {copiedField === "senha" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Blur overlay message */}
                        {isBlurred && (
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center border border-gray-100">
                                    <AlertTriangle size={28} className="text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-gray-900">Conteúdo protegido</p>
                                    <p className="text-xs text-gray-400 mt-1">Retorne à aba para visualizar</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                Credenciais pessoais e intransferíveis. Não compartilhe nem capture a tela.
                            </p>
                        </div>
                    </div>
                </div>
            </FocusTrap>
        </div>,
        document.body
    );
}
