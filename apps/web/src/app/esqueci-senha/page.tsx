"use client";

import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
                        Esqueceu sua senha?
                    </h1>
                    <p className="text-gray-500">
                        Sem problemas! Vamos te ajudar a recuperá-la.
                    </p>
                </div>

                {/* Form */}
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
