"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    ArrowRight,
    Loader2,
    RefreshCw,
    Mail,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { requestOTP, verifyEmailOTP } from "@/actions/verificacao";
import { useOtpInput } from "@/hooks/useOtpInput";
import { useCountdown } from "@/hooks/useCountdown";
import { useToast } from "@/hooks/useToast";

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified: () => void;
    pendingToken?: string | null;
}

/**
 * EmailVerificationModal
 * Handles OTP verification flow for new signups.
 * Follows SOLID (SRP via hooks) and Design System patterns.
 */
export function EmailVerificationModal({
    isOpen,
    onClose,
    email,
    onVerified,
    pendingToken
}: EmailVerificationModalProps) {
    const toast = useToast();
    const {
        otp,
        inputRefs,
        handleOtpChange,
        handleOtpKeyDown,
        handleOtpPaste,
        resetOtp,
        getOtpValue,
        isComplete
    } = useOtpInput(6);


    const {
        seconds,
        isActive: isTimerActive,
        resetCountdown
    } = useCountdown(60);

    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            resetOtp();
            resetCountdown();
            setError(null);
            setIsSuccess(false);
        }
    }, [isOpen, resetOtp, resetCountdown]);

    const handleVerifyEmail = async () => {
        if (!isComplete) return;

        setIsVerifying(true);
        setError(null);

        try {
            const code = getOtpValue();
            const res = await verifyEmailOTP(email, code, pendingToken || undefined);

            if (!res || !res.success) {
                const errorMessage = (res as any)?.error || "Código inválido ou erro na verificação.";
                setError(errorMessage);
                return;
            }

            // Success flow
            setIsSuccess(true);
            toast.success("E-mail verificado com sucesso!");

            // Allow user to see success state before closing
            setTimeout(onVerified, 1500);
        } catch (err) {
            console.error("[EmailVerificationModal.handleVerifyEmail]", err);
            setError("Erro ao verificar código. Tente novamente.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (isTimerActive || isResending) return;

        setIsResending(true);
        setError(null);

        try {
            const res = await requestOTP(email, "EMAIL");

            if (!res || !res.success) {
                const errorMessage = res && "error" in res ? res.error : "Erro ao reenviar código.";
                setError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            // Success: Reset UI state for the new code
            resetCountdown();
            resetOtp();
            toast.success("Novo código enviado com sucesso!");
        } catch (err) {
            console.error("[EmailVerificationModal.handleResendOtp]", err);
            const msg = "Falha técnica ao reenviar. Tente em instantes.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Verificação de E-mail"
            className="sm:max-w-md"
        >
            <div className="flex flex-col items-center text-center py-4">
                {/* Visual Identity Section */}
                <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-in zoom-in duration-700 ${isSuccess ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                        }`}
                >
                    {isSuccess ? <ShieldCheck size={40} /> : <Mail size={40} />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {isSuccess ? "Verificado!" : "Confirme seu e-mail"}
                </h3>

                <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[280px] mb-8">
                    {isSuccess
                        ? "Sua conta foi ativada. Redirecionando..."
                        : <>Enviamos um código de 6 dígitos para <span className="text-gray-900 font-bold">{email}</span></>
                    }
                </p>

                {!isSuccess && (
                    <div className="w-full space-y-6">
                        {/* OTP Input Grid */}
                        <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Código de verificação">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    autoComplete={index === 0 ? "one-time-code" : "off"}
                                    aria-label={`Dígito ${index + 1} de ${otp.length}`}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={(e) => handleOtpPaste(index, e)}
                                    className={`w-full h-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 transition-smooth outline-none caret-transparent ${error
                                        ? "border-red-200 bg-red-50/30 text-red-600 focus:border-red-400"
                                        : "border-gray-100 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        }`}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleVerifyEmail}
                            size="lg"
                            disabled={isVerifying || !isComplete}
                            className="w-full font-bold shadow-lg shadow-primary/20"
                        >
                            {isVerifying ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                <>
                                    Validar Código
                                    <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </Button>

                        <div className="flex flex-col items-center pt-2">
                            <div className="text-xs font-medium text-gray-400">
                                {isTimerActive ? (
                                    <span>Reenviar em <span className="text-gray-600 font-bold">{seconds}s</span></span>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={isResending}
                                        className="text-primary hover:underline font-bold flex items-center gap-1.5 transition-smooth active:scale-95"
                                    >
                                        {isResending && <Loader2 className="animate-spin" size={12} />}
                                        Reenviar código
                                        <RefreshCw size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <ShieldCheck size={12} className="text-primary/40" />
                    StreamShare Secure Verification
                </p>
            </div>
        </Modal>
    );
}
