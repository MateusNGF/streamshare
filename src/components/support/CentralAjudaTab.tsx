"use client";

import { BookOpen, ExternalLink, ArrowRight, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface CentralAjudaTabProps {
    onOpenTicket: () => void;
}

export function CentralAjudaTab({ onOpenTicket }: CentralAjudaTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 text-center">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-violet-100">
                    <BookOpen size={32} className="text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Encontre Respostas Rapidamente
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    A nossa Central de Ajuda tem dezenas de guias passo a passo sobre pagamentos, assinaturas e muito mais.
                </p>
                <Link href="/docs" passHref>
                    <Button className="w-full sm:w-auto shadow-lg shadow-violet-600/20" size="lg">
                        Acessar Documentação
                        <ExternalLink size={18} className="ml-2" />
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">
                        Ainda precisa de ajuda?
                    </span>
                </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                    <div className="bg-white p-3 rounded-full border border-gray-200 shrink-0">
                        <MessageCircleQuestion size={24} className="text-gray-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Falar com Suporte</h4>
                        <p className="text-sm text-gray-500">Tempo médio de resposta: 24h</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto shrink-0"
                    onClick={onOpenTicket}
                >
                    Abrir Chamado
                    <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
