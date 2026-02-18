"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { Eye, Calendar, ShieldCheck, MoreHorizontal, KeyRound } from "lucide-react";

interface MySubscriptionsGridProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
    onViewDetails: (id: number) => void;
    onViewCredentials: (sub: ParticipantSubscription) => void;
}

export function MySubscriptionsGrid({ subscriptions, currencyCode, onViewDetails, onViewCredentials }: MySubscriptionsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {subscriptions.map((sub, idx) => {
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
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col w-full justify-start items-start gap-4">
                                <div className="flex flex-row gap-3  items-center">
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
                                <span className="text-[10px]  font-bold text-green-600 bg-green-50/50 px-2.5 py-1 rounded-full whitespace-nowrap border border-green-100 shadow-sm">
                                    {formatarMoeda(sub.valorIntegral - sub.valor, currencyCode)} economizados
                                </span>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1">

                                    <Dropdown
                                        options={menuOptions}
                                        trigger={
                                            <div className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal size={18} />
                                            </div>
                                        }
                                    />
                                </div>
                                <StatusBadge status={sub.status} className="scale-75 origin-right" />
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

                            {isActive && sub.hasCredentials ? (
                                <button
                                    onClick={() => onViewCredentials(sub)}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group/btn active:scale-[0.98]"
                                >
                                    <KeyRound size={14} className="text-primary group-hover/btn:rotate-12 transition-transform" />
                                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Ver Credenciais</span>
                                </button>
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
