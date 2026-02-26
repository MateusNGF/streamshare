"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    AlertCircle,
    Clock,
    ChevronRight,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {step === 1 ? (
                <>
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="w-full sm:w-auto sm:mr-auto text-gray-400 hover:text-gray-600 border-none px-0"
                    >
                        Pular por 3 dias
                    </Button>
                    <Button
                        onClick={handleStartVerification}
                        className="w-full sm:w-auto gap-2"
                        disabled={isResending}
                    >
                        {isResending ? <Loader2 className="animate-spin" size={20} /> : "Começar Validação"}
                        <ChevronRight size={18} />
                    </Button>
                </>
            ) : (
                <>
                    {!isSuccess && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={isVerifying}
                            className="w-full sm:w-auto sm:mr-auto"
                        >
                            Voltar
                        </Button>
                    )}
                    {!isSuccess && (
                        <Button
                            onClick={handleVerifyEmail}
                            disabled={isVerifying || !isComplete}
                            className="w-full sm:w-auto"
                        >
                            {isVerifying ? <Loader2 className="animate-spin" size={20} /> : "Verificar agora"}
                        </Button>
                    )}
                </>
            )}
        </div>
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
            {/* Step Indicators (StreamingModal Style) */}
            <div className="mb-8 flex flex-row justify-center mx-auto sm:max-w-md max-w-xs  items-center  gap-4  ">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                    step === 1 ? "bg-primary border-primary text-white" : "bg-green-100 border-green-200 text-green-600"
                )}>
                    {step === 1 ? "1" : "✓"}
                </div>
                <div className="h-px bg-gray-100 flex-1" />
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                    step === 2 ? "bg-primary border-primary text-white" : "bg-gray-50 border-gray-200 text-gray-400"
                )}>
                    2
                </div>
            </div>

            <div className="mb-8 flex flex-col items-center text-center py-2">
                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 w-full">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto shadow-inner">
                            <ShieldCheck size={40} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Verifique sua identidade
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed mb-4 px-4">
                            Sua conta ainda não possui um e-mail verificado. Para garantir a segurança dos seus dados, valide seu acesso.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner ${isSuccess ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                            }`}>
                            {isSuccess ? <ShieldCheck size={40} /> : <Mail size={40} />}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isSuccess ? "Verificado!" : "Código de Confirmação"}
                        </h3>

                        <p className="text-gray-500 text-sm mb-8">
                            {isSuccess
                                ? "Excelente! Seu e-mail foi validado com sucesso."
                                : <>Enviamos um código para <span className="font-bold text-gray-900">{email}</span></>
                            }
                        </p>

                        {!isSuccess && (
                            <div className="space-y-6">
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
                                            className={cn(
                                                "w-full h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none",
                                                error
                                                    ? "border-red-200 bg-red-50 text-red-600"
                                                    : "border-gray-100 bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            )}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold">
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
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 mx-auto"
                                        >
                                            <RefreshCw size={12} className={isResending ? "animate-spin" : ""} />
                                            Reenviar código
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
