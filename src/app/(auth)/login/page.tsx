"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useAuthParams } from "@/hooks/useAuthParams";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { SecurityAlert } from "@/components/auth/SecurityAlert";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const LoginForm = dynamic(() => import("@/components/auth/LoginForm").then(mod => mod.LoginForm), {
    loading: () => (
        <div className="space-y-4 py-4">
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
        </div>
    )
});

const SignupForm = dynamic(() => import("@/components/auth/SignupForm").then(mod => mod.SignupForm), {
    loading: () => (
        <div className="space-y-4 py-4">
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
            <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
        </div>
    )
});

export default function AuthPage() {
    const { activeTab, setActiveTab, alertMessage, content } = useAuthParams();

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900 px-0 py-8 md:p-4">
            <AuthBackground />

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
                        <Link href="/" className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                    </div>

                    <AuthHeader activeTab={activeTab} content={content} />
                    <SecurityAlert message={alertMessage} />
                    <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
