"use client";

import { useMemo } from "react";
import {
    Calendar, Users, Wallet, X, TrendingUp, Info, Zap,
    ShieldCheck, ArrowRightLeft, DollarSign, PieChart,
    ArrowUpRight, ArrowDownRight, Activity, LayoutGrid, List,
    History
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Tooltip } from "@/components/ui/Tooltip";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingOption, ParticipanteOption, SelectedStreaming } from "../types";
import { escolherProximoDiaVencimento, calcularDataVencimentoPadrao, parseLocalDate } from "@/lib/financeiro-utils";

interface StepSummaryProps {
    selectedStreamings: StreamingOption[];
    selectedParticipants: ParticipanteOption[];
    configurations: Map<number, SelectedStreaming>;
    dataInicio: string;
    onDataInicioChange: (val: string) => void;
    cobrancaAutomatica: boolean;
    onCobrancaChange: (val: boolean) => void;
    primeiroCicloPago: boolean;
    onPrimeiroCicloChange: (val: boolean) => void;
    overloadedStreamings: StreamingOption[];
    financialAnalysis: {
        receitaMensalTotal: number;
        custoMensalTotal: number;
        lucroLiquidoMensal: number;
        totalProximaFatura: number;
        margemLucro: number;
        totalAssinaturas: number;
        isPastDate: boolean;
    };
    diasVencimento?: number[];
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
    primeiroCicloPago,
    onPrimeiroCicloChange,
    overloadedStreamings,
    financialAnalysis,
    diasVencimento = []
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
                        subLabel={diasVencimento.length > 0
                            ? escolherProximoDiaVencimento(diasVencimento, parseLocalDate(dataInicio)).toLocaleDateString('pt-BR')
                            : calcularDataVencimentoPadrao(parseLocalDate(dataInicio)).toLocaleDateString('pt-BR')}
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
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-gray-50/10">
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">Serviço</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-center">Vagas</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Faturamento</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Custo</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Margem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStreamings.map(s => {
                                        const config = configurations.get(s.id);
                                        const price = Number(config?.valor || 0);
                                        const cost = s.valorIntegral / s.limiteParticipantes;

                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3 border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <StreamingLogo
                                                            name={s.nome}
                                                            color={s.cor}
                                                            iconeUrl={s.iconeUrl}
                                                            size="xs"
                                                            rounded="lg"
                                                        />
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[11px] font-black text-gray-800 tracking-tight leading-none">{s.nome}</span>
                                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">ID: {s.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 border-b border-gray-50 last:border-0 text-center font-black text-[10px] text-gray-400">
                                                    {totalSlots} / {s.limiteParticipantes - s.ocupados}
                                                </td>
                                                <td className="px-5 py-3 border-b border-gray-50 last:border-0 text-right text-[11px] font-black text-gray-900 whitespace-nowrap">
                                                    {format(price * totalSlots)}
                                                </td>
                                                <td className="px-5 py-3 border-b border-gray-50 last:border-0 text-right text-[11px] font-black text-gray-400/80 whitespace-nowrap">
                                                    -{format(cost * totalSlots)}
                                                </td>
                                                <td className="px-5 py-3 border-b border-gray-50 last:border-0 text-right whitespace-nowrap">
                                                    <span className="text-[11px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
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
                        <div className="overflow-x-auto max-h-[280px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[500px]">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">Usuário</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-center">Vagas</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Valor Total</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Contribuição Lucro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedParticipants.map((p) => {
                                        const userRevenue = (financialAnalysis.receitaMensalTotal / totalSlots) * (p.quantidade || 1);
                                        const userProfit = (financialAnalysis.lucroLiquidoMensal / totalSlots) * (p.quantidade || 1);
                                        return (
                                            <tr key={p.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-500 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                            {p.nome.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-gray-800 leading-tight tracking-tight">{p.nome}</span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter opacity-60">{p.whatsappNumero}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="text-[10px] font-black text-gray-400">x{p.quantidade || 1}</span>
                                                </td>
                                                <td className="px-5 py-3 text-right font-black text-[11px] text-gray-900 whitespace-nowrap">
                                                    {format(userRevenue)}
                                                </td>
                                                <td className="px-5 py-3 text-right whitespace-nowrap">
                                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 tracking-tight">
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
                            <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block">Próximos Ciclos</label>
                                <Tooltip content="Todas as renovações futuras serão marcadas como Pagas automaticamente.">
                                    <Info size={10} className="text-gray-300" />
                                </Tooltip>
                            </div>
                            <span className="text-sm font-black text-gray-800 block leading-tight">Sempre Pago</span>
                        </div>
                    </div>
                    <Switch
                        checked={cobrancaAutomatica}
                        onCheckedChange={onCobrancaChange}
                        className="scale-90"
                    />
                </div>

                {/* Migration Toggle */}
                <div className={`flex-1 rounded-[22px] px-4 py-3 flex items-center justify-between border transition-all ${primeiroCicloPago ? 'bg-amber-50 border-amber-100' : 'bg-gray-50/50 border-transparent hover:border-gray-100'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl shadow-sm ring-1 ${primeiroCicloPago ? 'bg-white text-amber-600 ring-amber-200' : 'bg-white text-gray-400 ring-gray-100'
                            }`}>
                            <History size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <label className={`text-[9px] font-black uppercase tracking-widest leading-none block ${primeiroCicloPago ? 'text-amber-500' : 'text-gray-400'
                                    }`}>Migração</label>
                                <Tooltip content="Marca a primeira cobrança (e eventuais retroativas) como Paga.">
                                    <Info size={10} className="text-gray-300" />
                                </Tooltip>
                            </div>
                            <span className="text-sm font-black text-gray-800 block leading-tight">Ciclo Pago</span>
                        </div>
                    </div>
                    <Switch
                        checked={primeiroCicloPago}
                        onCheckedChange={onPrimeiroCicloChange}
                        className="scale-90 data-[state=checked]:bg-amber-500"
                    />
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

            {financialAnalysis.isPastDate && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-[24px] flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                        <History size={20} />
                    </div>
                    <div>
                        <h5 className="font-black text-[11px] uppercase tracking-wider text-amber-900 mb-1">Impacto de Retroatividade</h5>
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed max-w-2xl">
                            A data de início está no passado. O sistema irá gerar cobranças retroativas para cada ciclo desde a data escolhida até hoje.
                            Recomendamos marcar <strong className="text-amber-950 underline">Ciclo Pago</strong> acima se esses meses já foram liquidados fora do StreamShare.
                        </p>
                    </div>
                </div>
            )}

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
