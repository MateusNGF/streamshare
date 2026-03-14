"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { HelpCircle, TrendingDown } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface CobrancasByServiceBarProps {
    data: {
        name: string;
        total: number;
        count: number;
        color: string;
    }[];
}

export function CobrancasByServiceBar({ data }: CobrancasByServiceBarProps) {
    const { format } = useCurrency();
    const hasData = data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Inadimplência por Serviço</h3>
                            <UITooltip content="Ranking dos serviços com maior volume financeiro pendente ou em atraso no ciclo atual.">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500">Onde estão os maiores gargalos de recebimento</p>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-700">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                        <TrendingDown size={32} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">Tudo sob controle</h4>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px]">Parabéns! Nenhuma pendência significativa encontrada no período.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 80, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-gray-900 text-white p-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10">
                                                <div className="uppercase tracking-wider mb-1 opacity-60">{item.name}</div>
                                                <div className="text-lg text-red-400">{format(item.total)} pendentes</div>
                                                <div className="text-gray-400">{item.count} faturas em aberto</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="total"
                                radius={[0, 10, 10, 0]}
                                barSize={24}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || '#ef4444'} />
                                ))}
                                <LabelList
                                    dataKey="total"
                                    position="right"
                                    formatter={(val: any) => format(Number(val))}
                                    style={{ fontSize: 10, fontWeight: 900, fill: '#1e293b' }}
                                    offset={10}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
