"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FrequenciaPagamento } from "@prisma/client";
import { Info, Wallet, TrendingUp, Coins, Calendar, Users, CreditCard } from "lucide-react";
import { StreamingOption, SelectedStreaming } from "../../types";
import { INTERVALOS_MESES } from "@/lib/financeiro-utils";
import { cn } from "@/lib/utils";

interface ServiceConfigTableProps {
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    totalSlots: number;
    formatCurrency: (val: number) => string;
    onUpdateConfig?: (id: number, field: keyof SelectedStreaming, value: any) => void;
}

export function ServiceConfigTable({
    selectedStreamings,
    configurations,
    totalSlots,
    formatCurrency,
    onUpdateConfig
}: ServiceConfigTableProps) {
    return (
        <div className="space-y-4 mb-10">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-100/80 shadow-sm bg-white/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse tabular-nums">
                    <thead>
                        <tr className="bg-[#f9f9fb] border-b border-gray-100">
                            <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-[#87878a] tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <StreamingLogo name="" size="xs" className="opacity-0 w-0" /> {/* Spacer */}
                                    Serviço
                                </div>
                            </th>
                            <th className="px-2 py-4 text-[10px] font-extrabold uppercase text-[#87878a] tracking-wider text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Calendar size={12} className="opacity-40" />
                                    Frequência
                                </div>
                            </th>
                            <th className="px-2 py-4 text-[10px] font-extrabold uppercase text-[#87878a] tracking-wider text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <CreditCard size={12} className="opacity-40" />
                                    Valor Unit.
                                </div>
                            </th>
                            <th className="px-2 py-4 text-[10px] font-extrabold uppercase text-[#87878a] tracking-wider text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <Wallet size={12} className="opacity-40" />
                                    Faturamento
                                </div>
                            </th>
                            <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-[#87878a] tracking-wider text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <TrendingUp size={12} className="opacity-40" />
                                    Lucro Ciclo
                                    <Tooltip content="Diferença entre o valor cobrado e o custo base do serviço por vaga.">
                                        <Info size={11} className="text-gray-300 cursor-help" />
                                    </Tooltip>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {selectedStreamings.map(s => {
                            const config = configurations.get(s.id);
                            const frequencia = config?.frequencia || FrequenciaPagamento.mensal;
                            const multiplicador = INTERVALOS_MESES[frequencia] || 1;

                            const monthlyPrice = Number(config?.valor || 0);
                            const displayPrice = monthlyPrice * multiplicador;
                            const monthlyCost = s.valorIntegral / s.limiteParticipantes;
                            const displayCost = monthlyCost * multiplicador;

                            return (
                                <tr key={s.id} className="group hover:bg-black/[0.01] transition-colors duration-200">
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-3">
                                            <StreamingLogo
                                                name={s.nome}
                                                color={s.cor}
                                                iconeUrl={s.iconeUrl}
                                                size="sm"
                                                rounded="xl"
                                                className="shadow-sm border border-black/5"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 tracking-tight leading-none">{s.nome}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
                                                    <Users size={10} />
                                                    {totalSlots} vagas
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-5 text-center">
                                        {onUpdateConfig ? (
                                            <Select
                                                value={frequencia}
                                                onValueChange={(val) => onUpdateConfig(s.id, 'frequencia', val)}
                                            >
                                                <SelectTrigger className="h-9 text-xs font-bold w-32 mx-auto bg-white border-gray-200/60 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl border-gray-100">
                                                    <SelectItem value={FrequenciaPagamento.mensal}>Mensal</SelectItem>
                                                    <SelectItem value={FrequenciaPagamento.trimestral}>Trimestral</SelectItem>
                                                    <SelectItem value={FrequenciaPagamento.semestral}>Semestral</SelectItem>
                                                    <SelectItem value={FrequenciaPagamento.anual}>Anual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary" className="text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 bg-gray-100/80 text-gray-600">
                                                {frequencia}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-2 py-5 text-right">
                                        {onUpdateConfig ? (
                                            <div className="w-28 ml-auto group-focus-within:scale-105 transition-transform">
                                                <CurrencyInput
                                                    value={displayPrice}
                                                    onValueChange={(val) => {
                                                        const newValue = Number(val || 0);
                                                        const monthlyValue = newValue / multiplicador;
                                                        onUpdateConfig(s.id, 'valor', monthlyValue.toFixed(2));
                                                    }}
                                                    className="h-9 text-sm px-3 bg-white border-gray-200/60 rounded-xl font-bold text-right shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-5 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                                        {formatCurrency(displayPrice * totalSlots)}
                                    </td>
                                    <td className="px-5 py-5 text-right whitespace-nowrap">
                                        <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 px-2.5 py-1 rounded-lg font-bold shadow-sm border-0 hover:bg-emerald-100 transition-colors">
                                            +{formatCurrency((displayPrice - displayCost) * totalSlots)}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {selectedStreamings.map(s => {
                    const config = configurations.get(s.id);
                    const frequencia = config?.frequencia || FrequenciaPagamento.mensal;
                    const multiplicador = INTERVALOS_MESES[frequencia] || 1;
                    const monthlyPrice = Number(config?.valor || 0);
                    const displayPrice = monthlyPrice * multiplicador;
                    const monthlyCost = s.valorIntegral / s.limiteParticipantes;
                    const displayCost = monthlyCost * multiplicador;

                    return (
                        <div key={s.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <StreamingLogo
                                        name={s.nome}
                                        color={s.cor}
                                        iconeUrl={s.iconeUrl}
                                        size="sm"
                                        rounded="xl"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800 tracking-tight">{s.nome}</span>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                            {totalSlots} vagas
                                        </span>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 px-2 py-1 rounded-lg font-bold text-[10px]">
                                    +{formatCurrency((displayPrice - displayCost) * totalSlots)} / cíc.
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 flex flex-col justify-end">
                                    <span className="text-[9px] font-extrabold uppercase text-[#87878a] tracking-wider flex items-center gap-1">
                                        <Calendar size={10} /> Frequência
                                    </span>
                                    {onUpdateConfig ? (
                                        <Select
                                            value={frequencia}
                                            onValueChange={(val) => onUpdateConfig(s.id, 'frequencia', val)}
                                        >
                                            <SelectTrigger className="h-9 text-[11px] font-bold w-full bg-gray-50/50 border-gray-100 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value={FrequenciaPagamento.mensal}>Mensal</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.trimestral}>Trimestral</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.semestral}>Semestral</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.anual}>Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className="text-sm font-bold capitalize">{frequencia}</span>
                                    )}
                                </div>
                                <div className="space-y-1.5 flex flex-col items-end">
                                    <span className="text-[9px] font-extrabold uppercase text-[#87878a] tracking-wider flex items-center gap-1">
                                        <CreditCard size={10} /> Valor Unit.
                                    </span>
                                    {onUpdateConfig ? (
                                        <div className="w-full">
                                            <CurrencyInput
                                                value={displayPrice}
                                                onValueChange={(val) => {
                                                    const newValue = Number(val || 0);
                                                    const monthlyValue = newValue / multiplicador;
                                                    onUpdateConfig(s.id, 'valor', monthlyValue.toFixed(2));
                                                }}
                                                className="h-9 text-[12px] px-3 bg-gray-50/50 border-gray-100 rounded-xl font-bold text-right"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold">{formatCurrency(displayPrice)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[11px] font-extrabold uppercase text-[#87878a]">
                                <span>Faturamento Total do Ciclo</span>
                                <span className="text-gray-900 font-black text-sm tabular-nums">
                                    {formatCurrency(displayPrice * totalSlots)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
