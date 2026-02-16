"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatarMoeda } from "@/lib/financeiro-utils";
import {
    Eye,
    EyeOff,
    Calendar,
    ShieldCheck,
    Key,
    ChevronRight,
    TrendingUp,
    CreditCard,
    MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/Table";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";
import { getParticipantSubscriptionDetail } from "@/actions/dashboard";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface MySubscriptionsSectionProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
}

export function MySubscriptionsSection({ subscriptions, currencyCode }: MySubscriptionsSectionProps) {
    const [visibleCredentials, setVisibleCredentials] = useState<Record<number, boolean>>({});
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const toast = useToast();

    const toggleCredentials = (id: number) => {
        setVisibleCredentials(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleViewDetails = async (subId: number) => {
        setLoadingDetails(true);
        try {
            const fullSub = await getParticipantSubscriptionDetail(subId);
            setSelectedAssinatura(fullSub);
            setIsDetailsModalOpen(true);
        } catch (error: any) {
            toast.error(error.message || "Erro ao carregar detalhes");
        } finally {
            setLoadingDetails(false);
        }
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
                                            onClick: () => handleViewDetails(sub.id)
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
            )}

            <DetalhesAssinaturaModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                assinatura={selectedAssinatura}
            />
        </section>
    );
}
