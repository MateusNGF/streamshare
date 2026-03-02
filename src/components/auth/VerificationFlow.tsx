"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    Mail,
    AlertCircle,
    Clock,
    RefreshCw
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
    StepIndicator,
    StepContainer,
    StepIcon,
    StepHeader,
    StepNavigation
} from "@/components/ui/step-modal";
import { requestOTP, verifyEmailOTP } from "@/actions/verificacao";
import { useOtpInput } from "@/hooks/useOtpInput";
import { useCountdown } from "@/hooks/useCountdown";
import { useToast } from "@/hooks/useToast";

interface VerificationFlowProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified: () => void;
}

const STORAGE_KEY = "streamshare_verify_skipped";
const SKIP_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function VerificationFlow({
    isOpen,
    onClose,
    email,
    onVerified
}: VerificationFlowProps) {
    const toast = useToast();
    const [step, setStep] = useState<1 | 2>(1);
    const [isVisible, setIsVisible] = useState(false);

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

    // Visibility logic based on localStorage
    useEffect(() => {
        if (!isOpen) {
            setIsVisible(false);
            return;
        }

        const skippedData = localStorage.getItem(STORAGE_KEY);
        if (skippedData) {
            try {
                const { expiresAt } = JSON.parse(skippedData);
                if (new Date().getTime() < expiresAt) {
                    setIsVisible(false);
                    return;
                }
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        setIsVisible(true);
        setStep(1);
        resetOtp();
        setError(null);
        setIsSuccess(false);
    }, [isOpen, resetOtp]);

    const handleSkip = () => {
        const expiresAt = new Date().getTime() + SKIP_DURATION_MS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt }));
        setIsVisible(false);
        onClose();
    };

    const handleStartVerification = async () => {
        setIsResending(true);
        setError(null);
        try {
            const res = await requestOTP(email, "EMAIL");
            if (res.success) {
                setStep(2);
                resetCountdown();
            } else {
                setError(res.error || "Erro ao enviar código.");
            }
        } catch (err) {
            setError("Erro técnico ao solicitar código.");
        } finally {
            setIsResending(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!isComplete) return;

        setIsVerifying(true);
        setError(null);

        try {
            const code = getOtpValue();
            const res = await verifyEmailOTP(email, code);

            if (!res || !res.success) {
                setError((res as any)?.error || "Código inválido.");
                return;
            }

            setIsSuccess(true);
            toast.success("E-mail verificado com sucesso!");
            setTimeout(onVerified, 1500);
        } catch (err) {
            setError("Erro ao verificar código.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Auto-verify when OTP is complete
    useEffect(() => {
        if (isComplete && !isVerifying && !isSuccess) {
            handleVerifyEmail();
        }
    }, [isComplete]);

    const handleResendOtp = async () => {
        if (isTimerActive || isResending) return;

        setIsResending(true);
        setError(null);

        try {
            const res = await requestOTP(email, "EMAIL");
            if (res.success) {
                resetCountdown();
                resetOtp();
                toast.success("Novo código enviado!");
            } else {
                setError(res.error || "Erro ao enviar código.");
            }
        } catch (err) {
            setError("Falha técnica ao reenviar.");
        } finally {
            setIsResending(false);
        }
    };

    if (!isVisible) return null;

    const footer = (
        <StepNavigation
            step={step}
            totalSteps={2}
            isLoading={isResending || isVerifying}
            onBack={step === 2 && !isSuccess ? () => setStep(1) : undefined}
            onNext={step === 1 ? () => handleStartVerification() : () => handleVerifyEmail()}
            onSkip={handleSkip}
            skipLabel="Pular por 3 dias"
            canNext={step === 1 || isComplete}
            nextLabel={step === 2 ? "Verificar agora" : "Começar Validação"}
        />
    );

    return (
        <Modal
            isOpen={isVisible}
            onClose={onClose}
            title="Verificação de Acesso"
            className="sm:max-w-2xl"
            showCloseButton={step === 1}
            footer={footer}
        >
            <StepIndicator currentStep={step} totalSteps={2} />

            <div className="mb-8 py-2 min-h-[16rem] flex flex-col justify-center">
                {step === 1 ? (
                    <StepContainer step={1}>
                        <StepIcon icon={ShieldCheck} />
                        <StepHeader
                            title="Verifique sua identidade"
                            description="Sua conta ainda não possui um e-mail verificado. Para garantir a segurança dos seus dados, valide seu acesso."
                        />
                    </StepContainer>
                ) : (
                    <StepContainer step={2}>
                        <StepIcon
                            icon={isSuccess ? ShieldCheck : Mail}
                            variant={isSuccess ? "success" : "primary"}
                        />
                        <StepHeader
                            title={isSuccess ? "Verificado!" : "Código de Confirmação"}
                            description={isSuccess
                                ? "Excelente! Seu e-mail foi validado com sucesso."
                                : `Enviamos um código para ${email}`
                            }
                        />

                        {!isSuccess && (
                            <div className="space-y-6 max-w-sm mx-auto">
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={(e) => handleOtpPaste(index, e)}
                                            className="w-full h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all outline-none border-gray-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-in fade-in zoom-in-95">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <div className="text-center">
                                    {isTimerActive ? (
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                            <Clock size={12} />
                                            Reenviar em {seconds}s
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isResending}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 mx-auto transition-smooth"
                                        >
                                            <RefreshCw size={12} className={isResending ? "animate-spin" : ""} />
                                            Reenviar código
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </StepContainer>
                )}
            </div>
        </Modal>
    );
}
