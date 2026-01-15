"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

type AuthTab = "login" | "signup";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<AuthTab>("login");

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

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${activeTab === "login"
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${activeTab === "signup"
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Cadastrar
                    </button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {activeTab === "login" ? "Bem-vindo de volta!" : "Criar conta"}
                    </h1>
                    <p className="text-gray-500">
                        {activeTab === "login"
                            ? "Entre com sua conta para continuar"
                            : "Comece a gerenciar suas assinaturas"}
                    </p>
                </div>

                {/* Forms with Transition */}
                <div className="relative overflow-hidden">
                    <div
                        className={`transition-all duration-500 ease-in-out ${activeTab === "login"
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-full absolute inset-0"
                            }`}
                    >
                        <LoginForm />
                    </div>
                    <div
                        className={`transition-all duration-500 ease-in-out ${activeTab === "signup"
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-full absolute inset-0"
                            }`}
                    >
                        <SignupForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
