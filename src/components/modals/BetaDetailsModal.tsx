"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Info, AlertTriangle, ShieldCheck, Bug, Rocket, MessageSquare } from "lucide-react";
import { APP_VERSION } from "@/constants/app";

interface BetaDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BetaDetailsModal({ isOpen, onClose }: BetaDetailsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Bem-vindo ao StreamShare Beta! 🚀"
            className="sm:max-w-xl"
            footer={
                <Button onClick={onClose} className="w-full sm:w-auto">
                    Entendi, vamos lá!
                </Button>
            }
        >
            <div className="space-y-6 text-gray-600">
                <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 flex items-start gap-3">
                    <Info className="text-violet-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-violet-800 font-medium">
                        Você está acessando uma versão de testes. Algumas funcionalidades podem mudar ou apresentar instabilidades temporárias.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold">
                            <Rocket className="text-orange-500" size={18} />
                            <span>Novas Funcionalidades</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Estamos em constante evolução. Verifique a saúde do sistema:</p>
                        <Link href="/status" className="text-xs text-violet-600 hover:text-violet-700 underline font-medium block">
                            Ver Página de Status &rarr;
                        </Link>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold">
                            <Bug className="text-red-500" size={18} />
                            <span>Reporte Bugs</span>
                        </div>
                        <p className="text-xs text-gray-500">Encontrou algo estranho? Use o botão de suporte no canto inferior direito.</p>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold">
                            <ShieldCheck className="text-green-500" size={18} />
                            <span>Modo de Teste (Sandbox)</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Para testar pagamentos sem cobrança real, use este cartão:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                            <code className="block font-mono text-sm font-bold text-gray-800 select-all">4242 4242 4242 4242</code>
                            <span className="text-[10px] text-gray-400 block mt-1">Val: Futura | CVC: 123</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold">
                            <MessageSquare className="text-blue-500" size={18} />
                            <span>Seu Feedback</span>
                        </div>
                        <p className="text-xs text-gray-500">Sua opinião molda o futuro da plataforma. Conte-nos o que achou!</p>
                    </div>
                </div>

                <div className="text-xs text-gray-400 text-center mt-4">
                    Versão Atual: <span className="font-mono text-gray-500">v{APP_VERSION}-beta</span>
                </div>
            </div>
        </Modal>
    );
}
