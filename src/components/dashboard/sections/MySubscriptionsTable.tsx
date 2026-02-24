"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { Eye, Calendar, ShieldCheck, MoreHorizontal, KeyRound } from "lucide-react";
import { ParticipantSubscription } from "@/types/dashboard.types";
import { useCurrency } from "@/hooks/useCurrency";

interface MySubscriptionsTableProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
    onViewDetails: (id: number) => void;
    onViewCredentials: (sub: ParticipantSubscription) => void;
}

export function MySubscriptionsTable({ subscriptions, currencyCode, onViewDetails, onViewCredentials }: MySubscriptionsTableProps) {
    const { format } = useCurrency();
    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider py-5 px-6 min-w-[200px]">
                                Serviço
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[160px]">
                                Investimento
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[120px]">
                                Vencimento
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[190px]">
                                Acesso
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
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
                                            <div className="flex flex-col justify-center items-start w-full">
                                                <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {sub.streamingName}
                                                </span>
                                                <StatusBadge status={sub.status} className="scale-75" />
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-black text-gray-900 text-base whitespace-nowrap">
                                                    {format(sub.valor)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">/mês</span>
                                            </div>
                                            <div className="mt-0.5">
                                                <span className="text-[10px] font-medium text-green-600 whitespace-nowrap">
                                                    {format(sub.valorIntegral - sub.valor)} economizados
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2 font-bold text-gray-600 text-xs whitespace-nowrap">
                                            <Calendar size={12} className="text-primary/60" />
                                            {sub.proximoVencimento ? new Date(sub.proximoVencimento).toLocaleDateString() : 'A definir'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="whitespace-nowrap">
                                            {isActive && sub.hasCredentials ? (
                                                <button
                                                    onClick={() => onViewCredentials(sub)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group/btn active:scale-[0.98]"
                                                >
                                                    <KeyRound size={12} className="text-primary group-hover/btn:rotate-12 transition-transform" />
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Ver Credenciais</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <ShieldCheck size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Acesso Restrito</span>
                                                </div>
                                            )}
                                        </div>
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
