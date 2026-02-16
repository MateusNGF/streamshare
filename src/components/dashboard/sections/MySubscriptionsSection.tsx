"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { Eye, EyeOff, Calendar, ShieldCheck, Key } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface MySubscriptionsSectionProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
}

export function MySubscriptionsSection({ subscriptions, currencyCode }: MySubscriptionsSectionProps) {
    const [visibleCredentials, setVisibleCredentials] = useState<Record<number, boolean>>({});

    const toggleCredentials = (id: number) => {
        setVisibleCredentials(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Minhas Assinaturas</h2>
                </div>
            </div>

            {subscriptions.length === 0 ? (
                <div className="p-12 text-center border-dashed border-2 bg-gray-50/50 rounded-[32px] border-gray-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Nenhuma assinatura ativa</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Você ainda não faz parte de nenhum grupo de streaming.</p>
                        </div>
                        <Link href="/explore">
                            <Button variant="outline" className="rounded-full px-8">
                                Explorar Vagas
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {subscriptions.map((sub, idx) => (
                        <div
                            key={sub.id}
                            className="group relative bg-white rounded-[40px] p-1 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 animate-slide-in-from-bottom"
                            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                        >
                            <div className="bg-white rounded-[38px] p-6 h-full border border-transparent group-hover:border-primary/10 transition-colors">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex gap-5">
                                        <div
                                            className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white shadow-2xl shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                                            style={{
                                                backgroundColor: sub.streamingColor,
                                                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)`
                                            }}
                                        >
                                            {sub.streamingLogo ? (
                                                <div className="relative w-10 h-10">
                                                    <Image
                                                        src={sub.streamingLogo}
                                                        alt={sub.streamingName}
                                                        fill
                                                        className="object-contain brightness-0 invert"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-black text-2xl">{sub.streamingName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-xl tracking-tight">{sub.streamingName}</h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <Badge
                                                    variant={sub.status === 'ativa' ? 'success' : 'warning'}
                                                    className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    {sub.status === 'ativa' ? 'Ativo' : 'Pendente'}
                                                </Badge>
                                                <span className="text-[11px] font-black text-primary uppercase tracking-widest pl-2 border-l border-gray-100">
                                                    {formatarMoeda(sub.valor, currencyCode)} <small className="text-[9px] font-medium opacity-60">/mês</small>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 opacity-70">Vencimento</div>
                                        <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
                                            <Calendar size={14} className="text-primary" />
                                            {sub.proximoVencimento ? new Date(sub.proximoVencimento).toLocaleDateString() : 'A definir'}
                                        </div>
                                    </div>
                                </div>

                                {/* Credentials Area - Glass style */}
                                {sub.status === 'ativa' && (
                                    <div className="bg-gray-50/50 backdrop-blur-sm rounded-[28px] p-5 space-y-4 border border-gray-100/50 group-hover:bg-primary/[0.02] group-hover:border-primary/10 transition-all duration-500">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                                <Key size={12} className="text-primary" />
                                                Acesso Exclusivo
                                            </div>
                                            <button
                                                onClick={() => toggleCredentials(sub.id)}
                                                className="text-primary hover:text-accent transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                                            >
                                                {visibleCredentials[sub.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                {visibleCredentials[sub.id] ? 'Esconder' : 'Revelar'}
                                            </button>
                                        </div>

                                        {visibleCredentials[sub.id] && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Usuário</div>
                                                    <div className="bg-white/80 px-4 py-2.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-900 truncate shadow-sm">
                                                        {sub.credenciaisLogin || 'Não informado'}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Senha</div>
                                                    <div className="bg-white/80 px-4 py-2.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-900 truncate shadow-sm">
                                                        {sub.credenciaisSenha || '********'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Sua Economia</span>
                                        <span className="text-green-600 font-black text-lg">
                                            {formatarMoeda(sub.valorIntegral - sub.valor, currencyCode)}
                                            <small className="text-[10px] font-bold opacity-60 ml-1">/mês</small>
                                        </span>
                                    </div>
                                    <Link href={`/assinaturas/${sub.id}`}>
                                        <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full px-6 py-5 h-auto transition-all">
                                            Detalhes <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
