"use client";

import { VerificationFlow } from "./VerificationFlow";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface VerificationTriggerProps {
    email: string;
    emailVerificado: boolean;
}

export function VerificationTrigger({ email, emailVerificado }: VerificationTriggerProps) {
    const [isOpen, setIsOpen] = useState(!emailVerificado);
    const router = useRouter();

    if (emailVerificado) return null;

    return (
        <VerificationFlow
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            email={email}
            onVerified={() => {
                setIsOpen(false);
                router.refresh(); // Refresh to update layouts/components that depend on emailVerificado
            }}
        />
    );
}
