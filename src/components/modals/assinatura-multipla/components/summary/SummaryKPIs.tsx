"use client";

import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface CompactKPIProps {
    label: string;
    value: string;
    subLabel: string;
    icon: React.ReactNode;
    valueClass?: string;
    tooltip?: string;
}

function CompactKPI({ label, value, subLabel, icon, valueClass, tooltip }: CompactKPIProps) {
    return (
        <div className="px-4 py-2 border-r border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
            <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors leading-none">{label}</span>
                    {tooltip && (
                        <Tooltip content={tooltip}>
                            <Info size={10} className="text-white/10 hover:text-primary cursor-help" />
                        </Tooltip>
                    )}
                </div>
                {icon}
            </div>
            <p className={`text-base font-black tracking-tight leading-none mb-1 text-white ${valueClass}`}>{value}</p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{subLabel}</p>
        </div>
    );
}

interface SummaryKPIsProps {
    receitaTotal: string;
    custoTotal: string;
    lucroLiquido: string;
    margemLucro: number;
    totalFaturas: number;
    valorProximaFatura: string;
    dataVencimento: string;
}

export function SummaryKPIs({
    receitaTotal,
    custoTotal,
    lucroLiquido,
    margemLucro,
    totalFaturas,
    valorProximaFatura,
    dataVencimento
}: SummaryKPIsProps) {
    return (
        <div className="bg-[#1a1c20] rounded-[24px] p-2 shadow-xl border border-white/5 relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 relative z-10">
                <CompactKPI
                    label="Faturamento"
                    value={receitaTotal}
                    icon={<ArrowUpRight size={12} className="text-green-400" />}
                    subLabel={`${totalFaturas} faturas`}
                />
                <CompactKPI
                    label="Custo Operacional"
                    value={custoTotal}
                    icon={<ArrowDownRight size={12} className="text-blue-400" />}
                    subLabel="Preço base"
                />
                <CompactKPI
                    label="Lucro Líquido"
                    value={lucroLiquido}
                    icon={<TrendingUp size={12} className="text-primary" />}
                    valueClass="text-primary"
                    subLabel={`Margem ${margemLucro}%`}
                    tooltip="Receita total menos os custos base dos serviços selecionados."
                />
                <CompactKPI
                    label="Primeira Cobrança"
                    value={valorProximaFatura}
                    icon={<Wallet size={12} className="text-gray-400" />}
                    subLabel={dataVencimento}
                />
            </div>
        </div>
    );
}
