"use client";

import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportDocsBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-indigo-900 via-violet-800 to-fuchsia-900 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-5 blur-xl group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <BookOpen size={140} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl shrink-0 border border-white/20">
                        <BookOpen size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black mb-1 tracking-tight">Precisa de soluções rápidas?</h2>
                        <p className="text-violet-100 text-sm max-w-2xl">
                            Nossa Central de Ajuda cobre 90% das dúvidas: configuração do PIX, gestão de participantes e comprovativos.
                        </p>
                    </div>
                </div>
                <Link href="/docs" className="shrink-0 w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto text-primary hover:scale-105 border-0 font-bold shadow-xl transition-transform rounded-xl"
                    >
                        Acessar Documentação
                        <ExternalLink size={16} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
