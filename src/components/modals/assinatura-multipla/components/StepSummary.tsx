"use client";

import { useMemo } from "react";
import { Calendar, Users, Wallet, X, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useCurrency } from "@/hooks/useCurrency";
import { useBillingCalculations } from "@/hooks/useBillingCalculations";
import { calcularCustoBase, calcularTotalCiclo, arredondarMoeda } from "@/lib/financeiro-utils";
import { Prisma, FrequenciaPagamento } from "@prisma/client";
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
}

export function StepSummary({
    selectedStreamings,
    selectedParticipants,
    configurations,
    dataInicio,
    onDataInicioChange,
    cobrancaAutomatica,
    onCobrancaChange,
    overloadedStreamings
}: StepSummaryProps) {
    const { format } = useCurrency();
    const isOverloaded = overloadedStreamings.length > 0;

    const totalSlots = useMemo(() => {
        return selectedParticipants.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    }, [selectedParticipants]);

    const totalAssinaturas = configurations.size * totalSlots;

    const { receitaMensalTotal, totalProximaFatura, receitaMensalPorVaga, lucroLiquidoMensal, margemLucro } = useMemo(() => {
        let revenueMensal = new Prisma.Decimal(0);
        let custoMensal = new Prisma.Decimal(0);
        let nextCycleTotal = new Prisma.Decimal(0);

        configurations.forEach((c) => {
            const streaming = selectedStreamings.find(s => s.id === c.streamingId);
            if (!streaming) return;

            const valorCobrado = new Prisma.Decimal(c.valor || 0);
            const custoBase = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);

            revenueMensal = revenueMensal.plus(valorCobrado);
            custoMensal = custoMensal.plus(custoBase);

            const cycleTotalPerSeat = calcularTotalCiclo(c.valor, c.frequencia as FrequenciaPagamento);
            nextCycleTotal = nextCycleTotal.plus(cycleTotalPerSeat.mul(totalSlots));
        });

        const revenueGeral = revenueMensal.mul(totalSlots);
        const profitMensal = revenueGeral.minus(custoMensal.mul(totalSlots));
        const margin = revenueGeral.gt(0)
            ? profitMensal.div(revenueGeral).mul(100).toNumber()
            : 0;

        return {
            receitaMensalPorVaga: arredondarMoeda(revenueMensal).toNumber(),
            receitaMensalTotal: arredondarMoeda(revenueGeral).toNumber(),
            totalProximaFatura: arredondarMoeda(nextCycleTotal).toNumber(),
            lucroLiquidoMensal: arredondarMoeda(profitMensal).toNumber(),
            margemLucro: Math.round(margin)
        };
    }, [configurations, totalSlots, selectedStreamings]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Resumo e Confirmação</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Revise os detalhes financeiros e a data da primeira cobrança.
                </p>
            </div>

            {isOverloaded && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-pulse">
                    <h4 className="font-bold flex items-center gap-2 mb-1">
                        <X size={18} />
                        Limite de vagas excedido
                    </h4>
                    <p className="text-sm">
                        Alguns serviços selecionados não possuem vagas suficientes para {totalSlots} assinaturas.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Configuracoes Gerais */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            Geral
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 capitalize">
                                    Data de Início das Assinaturas
                                </label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => onDataInicioChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-gray-800 block">
                                        Cobrança Já Paga
                                    </label>
                                    <p className="text-[10px] text-gray-500">
                                        Gerar a primeira fatura com status "Pago".
                                    </p>
                                </div>
                                <Switch
                                    checked={cobrancaAutomatica}
                                    onCheckedChange={onCobrancaChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lista Participantes */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-h-[200px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2 sticky top-0 bg-gray-50 pb-2 z-10">
                            <Users size={14} className="text-primary" />
                            Participantes ({totalSlots})
                        </h4>
                        <div className="space-y-1.5">
                            {selectedParticipants.map(p => (
                                <div key={p.id} className="text-xs text-gray-700 flex items-center justify-between bg-white/50 p-2 rounded-lg border border-gray-100">
                                    <span className="font-medium truncate">{p.nome}</span>
                                    {(p.quantidade || 1) > 1 && (
                                        <span className="font-black bg-primary text-white px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter">
                                            {p.quantidade}x Vagas
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="border-2 border-gray-200 rounded-[32px] p-6 flex flex-col h-full bg-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                        <Wallet size={16} className="text-primary" />
                        Análise de Rentabilidade
                    </h4>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[160px] mb-4">
                        {selectedStreamings.map(streaming => {
                            const config = configurations.get(streaming.id);
                            if (!config) return null;
                            const cycleTotal = calcularTotalCiclo(config.valor, config.frequencia as FrequenciaPagamento);

                            return (
                                <div key={streaming.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <StreamingLogo
                                            name={streaming.nome}
                                            color={streaming.cor}
                                            size="sm"
                                            rounded="md"
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 leading-tight">
                                                {streaming.nome}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                Ciclo {config.frequencia}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm text-gray-800">
                                            {format(parseFloat(config.valor))}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-medium">por mês</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black text-primary flex items-center gap-1.5 uppercase tracking-[0.1em]">
                                        <TrendingUp size={12} />
                                        Lucro Líquido
                                    </span>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        Margem Estimada: <span className="text-green-600 font-black">{margemLucro}%</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary leading-none">
                                        {format(lucroLiquidoMensal)}
                                    </p>
                                    <p className="text-[9px] text-primary/40 font-black uppercase mt-1">/mês total líquido</p>
                                </div>
                            </div>

                            {lucroLiquidoMensal > 0 && (
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                    <div
                                        className="h-full bg-primary rounded-full animate-in slide-in-from-left duration-1000"
                                        style={{ width: `${Math.min(margemLucro, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
                                <span>Total Próxima Cobrança ({totalAssinaturas} itens)</span>
                                <span className="text-gray-900 text-sm font-black">{format(totalProximaFatura)}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 text-right leading-none">Soma dos ciclos iniciais de todos os membros</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
