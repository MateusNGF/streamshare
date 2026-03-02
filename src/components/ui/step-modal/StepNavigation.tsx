"use client";

import React from "react";
import { ChevronRight, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface StepNavigationProps {
    // Current state
    step: number;
    totalSteps: number;
    isLoading?: boolean;

    // Actions
    onBack?: () => void;
    onNext: () => void;
    onSkip?: () => void;

    // Customization
    nextLabel?: string;
    backLabel?: string;
    skipLabel?: string;
    nextIcon?: LucideIcon;

    // Validation
    canNext?: boolean;

    // Styling
    className?: string;
}

export function StepNavigation({
    step,
    totalSteps,
    isLoading = false,
    onBack,
    onNext,
    onSkip,
    nextLabel,
    backLabel = "Voltar",
    skipLabel = "Pular",
    nextIcon: NextIcon = ChevronRight,
    canNext = true,
    className
}: StepNavigationProps) {
    const isFirstStep = step === 1;
    const isLastStep = step === totalSteps;

    // Logic for next button label
    const finalNextLabel = nextLabel || (isLastStep ? "Concluir" : "Próximo");

    return (
        <div className={cn("flex flex-col sm:flex-row items-center gap-3 w-full", className)}>
            {/* Secondary Action (Left) */}
            {isFirstStep && onSkip ? (
                <Button
                    variant="outline"
                    onClick={onSkip}
                    disabled={isLoading}
                    className="w-full sm:w-auto sm:mr-auto text-gray-400 hover:text-gray-600 border-none px-0"
                >
                    {skipLabel}
                </Button>
            ) : onBack && step > 1 ? (
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-full sm:w-auto sm:mr-auto"
                >
                    {backLabel}
                </Button>
            ) : (
                // Spacer for layout consistency
                <div className="hidden sm:block sm:mr-auto" />
            )}

            {/* Primary Action (Right) */}
            <Button
                onClick={onNext}
                disabled={isLoading || !canNext}
                className="w-full sm:w-auto gap-2"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        {finalNextLabel}
                        {!isLastStep && <NextIcon size={18} />}
                    </>
                )}
            </Button>
        </div>
    );
}
