"use client";

import { useMemo } from "react";
import {
    Calendar, Users, Wallet, X, TrendingUp, Info, Zap,
    ShieldCheck, ArrowRightLeft, DollarSign, PieChart,
    ArrowUpRight, ArrowDownRight, Activity, LayoutGrid, List
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingOption, ParticipanteOption, SelectedStreaming } from "../types";

interface StepSummaryProps {
    selectedStreamings: StreamingOption[];
    selectedParticipants: ParticipanteOption[];
    configurations: Map<number, SelectedStreaming>;
    dataInicio: string;
    onDataInicioChange: (val: string) => void;
    cobrancaAutomatica: boolean;
    onCobrancaChange: (val: boolean) => void;
    overloadedStreamings: StreamingOption[];
    financialAnalysis: {
        receitaMensalTotal: number;
        custoMensalTotal: number;
        lucroLiquidoMensal: number;
        totalProximaFatura: number;
        margemLucro: number;
        totalAssinaturas: number;
    };
}

/**
 * COMPACT ENTERPRISE UI STRATEGY:
 * 1. Data Density: Use smaller fonts and tighter spacing to show more without scrolling.
 * 2. Sectional Tables: Separate service breakdown from member breakdown.
 * 3. Unified Financial Bar: A high-density bar for totals.
 */

export function StepSummary({
    selectedStreamings,
    selectedParticipants,
    configurations,
    dataInicio,
    onDataInicioChange,
    cobrancaAutomatica,
    onCobrancaChange,
    overloadedStreamings,
    financialAnalysis
}: StepSummaryProps) {
    const { format } = useCurrency();
    const isOverloaded = overloadedStreamings.length > 0;
    const totalSlots = useMemo(() => {
        return selectedParticipants.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    }, [selectedParticipants]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-4">

            {/* 1. COMPACT KPI BAR */}
            <div className="bg-[#1a1c20] rounded-[24px] p-1.5 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 relative z-10">
                    <CompactKPI
                        label="Faturamento"
                        value={format(financialAnalysis.receitaMensalTotal)}
                        icon={<ArrowUpRight size={12} className="text-green-400" />}
                        subLabel={`${financialAnalysis.totalAssinaturas} faturas`}
                    />
                    <CompactKPI
                        label="Custo Operacional"
                        value={format(financialAnalysis.custoMensalTotal)}
                        icon={<ArrowDownRight size={12} className="text-blue-400" />}
                        subLabel="Preço base"
                    />
                    <CompactKPI
                        label="Lucro Líquido"
                        value={format(financialAnalysis.lucroLiquidoMensal)}
                        icon={<TrendingUp size={12} className="text-primary" />}
                        valueClass="text-primary"
                        subLabel={`Margem ${financialAnalysis.margemLucro}%`}
                    />
                    <CompactKPI
                        label="Primeira Cobrança"
                        value={format(financialAnalysis.totalProximaFatura)}
                        icon={<Wallet size={12} className="text-gray-400" />}
                        subLabel={dataInicio.split('-').reverse().join('/')}
                    />
                </div>
            </div>

            {/* 2. MAIN TABLES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* A. SERVICES BREAKDOWN (Compact Table) */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={14} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Breakdown por Serviço</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/10">
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50">Streaming</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50">Vagas</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-right">Faturamento</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-right">Custo</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-right">Lucro Est.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStreamings.map(s => {
                                        const config = configurations.get(s.id);
                                        const price = Number(config?.valor || 0);
                                        const cost = s.valorIntegral / s.limiteParticipantes;

                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-2 border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <StreamingLogo
                                                            name={s.nome}
                                                            color={s.cor}
                                                            iconeUrl={s.iconeUrl}
                                                            size="xs"
                                                            rounded="md"
                                                        />
                                                        <span className="text-[11px] font-bold text-gray-700">{s.nome}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2 border-b border-gray-50 last:border-0">
                                                    <span className="text-[10px] font-black text-gray-400">{totalSlots} / {s.limiteParticipantes - s.ocupados}</span>
                                                </td>
                                                <td className="px-5 py-2 border-b border-gray-50 last:border-0 text-right text-[11px] font-bold text-gray-900">
                                                    {format(price * totalSlots)}
                                                </td>
                                                <td className="px-5 py-2 border-b border-gray-50 last:border-0 text-right text-[11px] font-bold text-gray-400">
                                                    -{format(cost * totalSlots)}
                                                </td>
                                                <td className="px-5 py-2 border-b border-gray-50 last:border-0 text-right">
                                                    <span className="text-[11px] font-black text-green-600">
                                                        +{format((price - cost) * totalSlots)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* B. PARTICIPANTS LIST (High Density) */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribuição por Membro</span>
                            </div>
                            {!isOverloaded && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100">
                                    <ShieldCheck size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Lote Válido</span>
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto max-h-[240px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50">Usuário</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-center">Vagas</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-right">Valor Mensal</th>
                                        <th className="px-5 py-2 text-[9px] font-black uppercase text-gray-400 border-b border-gray-50 text-right">Contribuição Lucro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedParticipants.map((p) => {
                                        const userRevenue = (financialAnalysis.receitaMensalTotal / totalSlots) * (p.quantidade || 1);
                                        const userProfit = (financialAnalysis.lucroLiquidoMensal / totalSlots) * (p.quantidade || 1);
                                        return (
                                            <tr key={p.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-primary transition-colors">
                                                            {p.nome.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-gray-800 leading-tight">{p.nome}</span>
                                                            <span className="text-[8px] text-gray-400 font-bold uppercase">{p.whatsappNumero}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5 text-center">
                                                    <span className="text-[10px] font-black text-gray-600 opacity-60">x{p.quantidade || 1}</span>
                                                </td>
                                                <td className="px-5 py-2.5 text-right font-black text-[11px] text-gray-900">
                                                    {format(userRevenue)}
                                                </td>
                                                <td className="px-5 py-2.5 text-right">
                                                    <span className="text-[10px] font-black text-green-500 uppercase">
                                                        +{format(userProfit)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. SETTINGS & FINAL VALIDATION BAR */}
            <div className="bg-white border border-gray-100 rounded-[28px] p-2 shadow-sm flex flex-col md:flex-row items-stretch gap-2">
                {/* Date Selection */}
                <div className="flex-1 bg-gray-50/50 rounded-[22px] px-4 py-3 flex items-center gap-4 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="p-2 bg-white rounded-xl text-primary shadow-sm ring-1 ring-gray-100">
                        <Calendar size={18} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block">Início da Operação</label>
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={(e) => onDataInicioChange(e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 focus:ring-0 outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Status Automation Switch */}
                <div className="flex-1 bg-gray-50/50 rounded-[22px] px-4 py-3 flex items-center justify-between border border-transparent hover:border-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl text-primary shadow-sm ring-1 ring-gray-100">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block">Automação</label>
                            <span className="text-sm font-black text-gray-800 block leading-tight">Marcar como Pago</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <Switch
                            checked={cobrancaAutomatica}
                            onCheckedChange={onCobrancaChange}
                            className="scale-90"
                        />
                    </div>
                </div>

                {/* Efficiency Badge */}
                <div className="flex-1 bg-primary text-white rounded-[22px] px-5 py-3 flex items-center justify-between shadow-lg shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                            <TrendingUp size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none block">Margem Lote</label>
                            <span className="text-lg font-black block leading-none">{financialAnalysis.margemLucro}%</span>
                        </div>
                    </div>
                    <div className="relative z-10 p-1.5 bg-white/20 rounded-lg">
                        <Zap size={14} className="fill-white" />
                    </div>
                </div>
            </div>

            {isOverloaded && (
                <div className="p-4 bg-red-50 border-2 border-red-100 rounded-[20px] text-red-700 flex items-center gap-4 animate-bounce-subtle">
                    <div className="p-2 bg-red-100 rounded-xl shrink-0">
                        <X size={18} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase tracking-tight">Capacidade Excedida</h5>
                        <p className="text-[10px] font-bold opacity-80">Você excedeu as vagas disponíveis em um ou mais serviços.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function CompactKPI({ label, value, subLabel, icon, valueClass }: { label: string, value: string, subLabel: string, icon: React.ReactNode, valueClass?: string }) {
    return (
        <div className="px-4 py-3 border-r border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors uppercase leading-none">{label}</span>
                {icon}
            </div>
            <p className={`text-base font-black tracking-tight leading-none mb-1.5 text-white ${valueClass}`}>{value}</p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{subLabel}</p>
        </div>
    );
}
