"use client";

import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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
                    href="/login"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group p-2"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="font-medium hidden md:inline">Voltar para login</span>
                </Link>
            </div>

            <div className="relative z-10 w-full md:max-w-lg mx-auto">
                {/* Main Card */}
                <div className="bg-white rounded-none md:rounded-[32px] shadow-2xl p-6 md:p-10 relative overflow-hidden w-full">
                    {/* Back Button (Mobile) */}
                    <div className="absolute top-4 left-4 md:hidden z-20">
                        <Link
                            href="/login"
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

                    {/* Headers */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Esqueceu sua senha?
                        </h1>
                        <p className="text-gray-500 max-w-xs mx-auto md:max-w-none">
                            Sem problemas! Vamos te ajudar a recuperá-la.
                        </p>
                    </div>

                    {/* Form */}
                    <ForgotPasswordForm />
                </div>

                {/* Footer Info */}
                <p className="text-center text-gray-400 text-xs md:text-sm mt-6 md:mt-8 px-4">
                    &copy; {new Date().getFullYear()} StreamShare. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
