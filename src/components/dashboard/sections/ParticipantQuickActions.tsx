"use client";

import {
    Compass,
    Wallet,
    Settings,
    MessageSquare,
    ArrowRight,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ParticipantQuickActionsProps {
    onOpenSupport: () => void;
}

export function ParticipantQuickActions({ onOpenSupport }: ParticipantQuickActionsProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Atalhos do Participante</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-2 -m-2">
                {/* Destaque: Explorar */}
                <Link
                    href="/explore"
                    className="group relative overflow-hidden bg-primary rounded-[32px] p-8 text-white shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all duration-500 lg:col-span-1"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                            <Compass className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                Explorar Vagas
                                <Sparkles size={16} className="text-accent animate-pulse" />
                            </h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                                Encontre novos grupos e economize até 80% em suas assinaturas.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-primary px-5 py-2.5 rounded-full w-fit group-hover:gap-4 transition-all">
                                Ver Catálogo <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                    {/* Abstract background blobs */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                </Link>

                {/* Faturas */}
                <Link
                    href="/faturas"
                    className="group flex flex-col justify-between bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:scale-[1.01]"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <Wallet className="text-emerald-600" size={28} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Tudo em dia</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Minhas Faturas</h3>
                        <p className="text-gray-400 text-sm font-medium mb-6">Controle seus pagamentos e histórico.</p>
                        <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            Acessar Finanças <ArrowRight size={14} />
                        </div>
                    </div>
                </Link>

                {/* Suporte & Configurações */}
                <div className="grid grid-rows-2 gap-4 md:gap-6 lg:col-span-1">
                    <button
                        onClick={onOpenSupport}
                        className="group flex items-center gap-5 bg-white rounded-[28px] p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-left hover:scale-[1.01]"
                    >
                        <div className="bg-violet-50 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                            <MessageSquare className="text-primary" size={26} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-base leading-tight">Central de Ajuda</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em] mt-1">Falar com suporte</p>
                        </div>
                    </button>

                    <Link
                        href="/configuracoes?tab=usuario"
                        className="group flex items-center gap-5 bg-white rounded-[28px] p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:scale-[1.01]"
                    >
                        <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-90 transition-all duration-500">
                            <Settings className="text-gray-400 group-hover:text-primary" size={26} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-base leading-tight">Configurações</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em] mt-1">Gerenciar perfil</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
