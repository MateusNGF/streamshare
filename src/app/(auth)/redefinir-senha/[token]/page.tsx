"use client";

import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
    const params = useParams();
    const token = params.token as string;
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        // Simular validação de token (será implementado no backend)
        const validateToken = async () => {
            try {
                // Por enquanto, aceitar qualquer token que não seja vazio
                if (token && token.length > 10) {
                    setIsValid(true);
                } else {
                    setIsValid(false);
                }
            } catch (error) {
                setIsValid(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    if (isValidating) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
                <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 w-full max-w-md">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Validando token...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
                <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Image
                            src="/assets/logo-branca.jpg"
                            alt="StreamShare Logo"
                            width={64}
                            height={64}
                            className="rounded-2xl"
                        />
                        <span className="text-3xl font-bold text-gray-900">StreamShare</span>
                    </div>

                    {/* Error Message */}
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-xl text-center">
                        <AlertCircle size={48} className="mx-auto mb-3 text-red-600" />
                        <h3 className="font-bold text-lg mb-2">Token Inválido ou Expirado</h3>
                        <p className="text-sm mb-4">
                            O link de redefinição de senha é inválido ou já expirou.
                        </p>
                        <Link
                            href="/esqueci-senha"
                            className="inline-block bg-primary hover:bg-accent text-white py-3 px-6 rounded-xl font-bold transition-all"
                        >
                            Solicitar Novo Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare Logo"
                        width={64}
                        height={64}
                        className="rounded-2xl"
                    />
                    <span className="text-3xl font-bold text-gray-900">StreamShare</span>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Redefinir Senha
                    </h1>
                    <p className="text-gray-500">
                        Digite sua nova senha abaixo
                    </p>
                </div>

                {/* Form */}
                <ResetPasswordForm token={token} />
            </div>
        </div>
    );
}
