"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { Eye, EyeOff, Calendar, ShieldCheck, MoreHorizontal, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MySubscriptionsGridProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
    onViewDetails: (id: number) => void;
}

export function MySubscriptionsGrid({ subscriptions, currencyCode, onViewDetails }: MySubscriptionsGridProps) {
    const [visibleCredentials, setVisibleCredentials] = useState<Record<number, boolean>>({});

    const toggleCredentials = (id: number) => {
        setVisibleCredentials(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub, idx) => {
                const isVisible = visibleCredentials[sub.id];
                const isActive = sub.status === 'ativa';

                const menuOptions = [
                    {
                        label: "Ver Detalhes",
                        icon: <Eye size={16} />,
                        onClick: () => onViewDetails(sub.id)
                    }
                ];

                return (
                    <div
                        key={sub.id}
                        className="group bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <StreamingLogo
                                    name={sub.streamingName}
                                    iconeUrl={sub.streamingLogo}
                                    color={sub.streamingColor}
                                    size="md"
                                    rounded="2xl"
                                    className="shadow-md group-hover:rotate-6 transition-transform duration-300"
                                />
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-primary leading-tight group-hover:underline decoration-2 underline-offset-4 transition-all">
                                        {sub.streamingName}
                                    </h3>
                                    <span className="font-black text-xl text-gray-900">
                                        {formatarMoeda(sub.valor, currencyCode)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1">
                                    <StatusBadge status={sub.status} className="scale-75 origin-right" />
                                    <Dropdown
                                        options={menuOptions}
                                        trigger={
                                            <div className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal size={18} />
                                            </div>
                                        }
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap border border-green-100 shadow-sm">
                                    Economia: {formatarMoeda(sub.valorIntegral - sub.valor, currencyCode)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <Calendar size={14} /> Vencimento
                                </span>
                                <span className="font-bold text-gray-700">
                                    {sub.proximoVencimento ? new Date(sub.proximoVencimento).toLocaleDateString() : 'A definir'}
                                </span>
                            </div>

                            {isActive ? (
                                <div className="bg-gray-50/80 rounded-xl p-3 border border-transparent group-hover:border-primary/10 group-hover:bg-primary/[0.02] transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credenciais de Acesso</div>
                                        <button
                                            onClick={() => toggleCredentials(sub.id)}
                                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                                        >
                                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 font-medium">Login</span>
                                            <span className="text-xs font-bold text-gray-700 select-all">
                                                {isVisible ? sub.credenciaisLogin : '••••••••••••'}
                                            </span>
                                        </div>
                                        {isVisible && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 font-medium">Senha</span>
                                                <span className="text-xs font-bold text-gray-700 select-all">
                                                    {sub.credenciaisSenha}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl text-gray-400 border border-dashed border-gray-200">
                                    <ShieldCheck size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Acesso Restrito</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
