"use client";

import Link from "next/link";
import { Ghost, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-12 w-full max-w-md text-center">
                {/* Icon */}
                <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Ghost size={48} className="text-primary" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Página não encontrada
                </h1>

                {/* Description */}
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Ops! A página que você está procurando parece ter desaparecido ou o link está incorreto.
                </p>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white py-3.5 px-6 rounded-xl font-bold transition-all"
                    >
                        Voltar para o Início
                    </Link>

                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => window.history.back()}
                        className="w-full justify-center"
                    >
                        <ArrowLeft size={18} />
                        Voltar para trás
                    </Button>
                </div>
            </div>
        </div>
    );
}
