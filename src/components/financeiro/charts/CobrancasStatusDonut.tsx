"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface CobrancasStatusDonutProps {
    data: {
        name: string;
        value: number;
        amount: number;
        color: string;
    }[];
    totalExpected: number;
}

export function CobrancasStatusDonut({ data, totalExpected }: CobrancasStatusDonutProps) {
    const { format } = useCurrency();
    const totalCount = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = totalCount > 0;

    const paidItem = data.find(d => d.name === 'Pagas');
    const healthPercentage = paidItem && totalCount > 0 ? Math.round((paidItem.value / totalCount) * 100) : 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Status do Ciclo Atual</h3>
                            <UITooltip content="Proporção de cobranças por status no mês atual. O centro exibe o valor total previsto para o período.">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500">Distribuição volumétrica por status</p>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Nenhuma cobrança gerada neste ciclo.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-h-[220px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Previsto</span>
                            <span className="text-xl font-black text-gray-900">{format(totalExpected)}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                                {healthPercentage}% pagas
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-gray-900 text-white p-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                        <span className="uppercase tracking-wider">{item.name}</span>
                                                    </div>
                                                    <div className="text-lg">{item.value} cobranças</div>
                                                    <div className="text-gray-400">{format(item.amount)}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-50 pt-6">
                        {data.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <span className="text-sm font-black text-gray-900">{item.value}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
