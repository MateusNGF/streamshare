"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { HelpCircle, TrendingDown } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface SavingsAccumulatedChartProps {
    data: {
        month: string;
        pago: number;
        solo: number;
        economia: number;
    }[];
}

export function SavingsAccumulatedChart({ data }: SavingsAccumulatedChartProps) {
    const { format } = useCurrency();
    const hasData = data && data.length > 0;
    const totalSaved = data.reduce((acc, curr) => acc + curr.economia, 0);

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <TrendingDown size={120} />
            </div>

            <div className="mb-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Vale a pena continuar?</h3>
                            <UITooltip content="Compara o que você paga aqui com o preço que pagaria assinando sozinho. Ver o verde crescer é o melhor sinal!">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500">Minha economia real com o StreamShare</p>
                    </div>
                    {totalSaved > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Poupado</p>
                            <p className="text-xl font-black text-emerald-600">{format(totalSaved)}</p>
                        </div>
                    )}
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Aguardando mais ciclos para calcular sua economia.</p>
                </div>
            ) : (
                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            barGap={-40}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const { solo, pago, economia } = payload[0].payload;
                                        return (
                                            <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[200px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                                    {label}
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between gap-4 text-gray-400">
                                                        <span className="text-[10px] font-bold uppercase">Preço Solo</span>
                                                        <span className="text-xs font-bold line-through">{format(solo)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-[10px] font-bold uppercase text-white">Preço Shared</span>
                                                        <span className="text-sm font-black text-white">{format(pago)}</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 bg-emerald-500/10 -mx-2 px-2 py-1 rounded-lg">
                                                        <span className="text-[10px] font-bold uppercase text-emerald-400">Você Poupou</span>
                                                        <span className="text-lg font-black text-emerald-400">{format(economia)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Barra de Background (Preço Solo) */}
                            <Bar
                                dataKey="solo"
                                fill="#f3f4f6"
                                radius={[12, 12, 0, 0]}
                                barSize={40}
                                isAnimationActive={false}
                            />
                            {/* Barra de destaque (O que pagou) */}
                            <Bar
                                dataKey="pago"
                                fill="#8b5cf6"
                                radius={[12, 12, 0, 0]}
                                barSize={40}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#8b5cf6" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
