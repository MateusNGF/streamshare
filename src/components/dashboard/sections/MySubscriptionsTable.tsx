"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { Eye, EyeOff, Calendar, ShieldCheck, MoreHorizontal } from "lucide-react";
import { ParticipantSubscription } from "@/types/dashboard.types";
import { useState } from "react";

interface MySubscriptionsTableProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
    onViewDetails: (id: number) => void;
}

export function MySubscriptionsTable({ subscriptions, currencyCode, onViewDetails }: MySubscriptionsTableProps) {
    const [visibleCredentials, setVisibleCredentials] = useState<Record<number, boolean>>({});

    const toggleCredentials = (id: number) => {
        setVisibleCredentials(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider py-5 px-6">
                                Serviço
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Investimento
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Vencimento
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[180px]">
                                Acesso
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
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
                                <TableRow
                                    key={sub.id}
                                    className="group animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <StreamingLogo
                                                name={sub.streamingName}
                                                iconeUrl={sub.streamingLogo}
                                                color={sub.streamingColor}
                                                size="sm"
                                                rounded="xl"
                                                className="shadow-sm group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {sub.streamingName}
                                                </span>
                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">
                                                    Economia: {formatarMoeda(sub.valorIntegral - sub.valor, currencyCode)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={sub.status} className="scale-75" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-gray-900">
                                                {formatarMoeda(sub.valor, currencyCode)}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">por mês</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2 font-bold text-gray-600 text-xs">
                                            <Calendar size={12} className="text-primary/60" />
                                            {sub.proximoVencimento ? new Date(sub.proximoVencimento).toLocaleDateString() : 'A definir'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isActive ? (
                                            <div className="bg-gray-50/80 rounded-xl p-2 flex items-center justify-between gap-2 border border-transparent group-hover:border-primary/10 group-hover:bg-primary/[0.02] transition-all">
                                                <div className="flex flex-col min-w-0">
                                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Login / Senha</div>
                                                    <div className="text-[11px] font-bold text-gray-700 truncate">
                                                        {isVisible ? sub.credenciaisLogin : '••••••••••••'}
                                                    </div>
                                                    {isVisible && (
                                                        <div className="text-[11px] font-bold text-gray-400 truncate mt-0.5">
                                                            {sub.credenciaisSenha}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => toggleCredentials(sub.id)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                                                >
                                                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <ShieldCheck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Acesso Restrito</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Dropdown
                                            options={menuOptions}
                                            trigger={
                                                <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal size={18} />
                                                </div>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
