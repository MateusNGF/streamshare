"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type AuthTab = "login" | "signup";

export default function AuthPage() {
    const searchParams = useSearchParams();
    const hasPlan = searchParams.get("plan");
    const [activeTab, setActiveTab] = useState<AuthTab>(hasPlan ? "signup" : "login");

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900 px-0 py-8 md:p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-[0.03]" />
            </div>

            {/* Back Button (Desktop) */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 hidden md:block">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group p-2 -ml-2"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="font-medium hidden md:inline">Voltar para home</span>
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto">
                {/* Main Card */}
                <div className="bg-white rounded-none md:rounded-[32px] shadow-2xl p-6 md:p-10 relative overflow-hidden w-full">
                    {/* Back Button (Mobile) */}
                    <div className="absolute top-4 left-4 md:hidden z-20">
                        <Link
                            href="/"
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </Link>
                    </div>

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center gap-3">
                            <Image
                                src="/assets/logo-branca.jpg"
                                alt="StreamShare Logo"
                                width={48}
                                height={48}
                                className="rounded-xl w-10 h-10 md:w-12 md:h-12"
                            />
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">StreamShare</span>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-6 md:mb-8 relative">
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
                                }`}
                        />
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`relative flex-1 py-3 text-sm font-bold transition-colors z-10 ${activeTab === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`relative flex-1 py-3 text-sm font-bold transition-colors z-10 ${activeTab === "signup" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Criar conta
                        </button>
                    </div>

                    {/* Headers */}
                    <div className="text-center mb-6 md:mb-8">
                        <div className="relative h-16 overflow-hidden">
                            <div
                                className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center ${activeTab === "login"
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 -translate-y-8"
                                    }`}
                            >
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
                                <p className="text-sm md:text-base text-gray-500">Acesse sua conta para gerenciar assinaturas</p>
                            </div>
                            <div
                                className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center ${activeTab === "signup"
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-8"
                                    }`}
                            >
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
                                <p className="text-sm md:text-base text-gray-500">Comece a economizar com StreamShare hoje</p>
                            </div>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="relative">
                        <div
                            className={`transition-all duration-500 ease-in-out ${activeTab === "login"
                                ? "opacity-100 translate-x-0 relative z-10"
                                : "opacity-0 -translate-x-10 absolute inset-0 pointer-events-none"
                                }`}
                        >
                            <LoginForm />
                        </div>
                        <div
                            className={`transition-all duration-500 ease-in-out ${activeTab === "signup"
                                ? "opacity-100 translate-x-0 relative z-10"
                                : "opacity-0 translate-x-10 absolute inset-0 pointer-events-none"
                                }`}
                        >
                            <SignupForm />
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="text-center text-gray-400 text-xs md:text-sm mt-6 md:mt-8">
                    &copy; {new Date().getFullYear()} StreamShare. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
