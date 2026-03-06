"use client";

import { MessageCircleQuestion, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Como podemos ajudar?"
            className="sm:max-w-xl"
        >
            <div className="space-y-4 py-4">
                {/* Central de Ajuda - Link */}
                <Link
                    href="/docs"
                    onClick={onClose}
                    className="block p-5 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                        <BookOpen size={80} />
                    </div>
                    <div className="relative flex justify-between items-center z-10">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-xl shrink-0">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center">
                                    Central de Ajuda
                                    <ExternalLink size={14} className="ml-2 opacity-70" />
                                </h3>
                                <p className="text-violet-100 text-sm max-w-[260px]">
                                    Guias rápidos, tutoriais e respostas para as dúvidas mais comuns.
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex shrink-0 bg-white/20 rounded-full p-2 group-hover:translate-x-1 transition-transform">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                            Ou
                        </span>
                    </div>
                </div>

                {/* Chamados - Link */}
                <Link
                    href="/chamados"
                    onClick={onClose}
                    className="block p-5 bg-white border border-gray-200 hover:border-violet-300 rounded-2xl hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 group"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-start gap-4">
                            <div className="bg-violet-50 p-3 rounded-xl shrink-0 group-hover:bg-violet-100 transition-colors">
                                <MessageCircleQuestion size={24} className="text-violet-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">
                                    Falar com o Suporte
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Abra um chamado ou verifique o histórico das suas solicitações.
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex shrink-0 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>
            </div>
        </Modal>
    );
}
