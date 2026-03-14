"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HelpCircle, Wallet } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface FaturaCompositionDonutProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    totalCurrentMonth: number;
}

export function FaturaCompositionDonut({ data, totalCurrentMonth }: FaturaCompositionDonutProps) {
    const { format } = useCurrency();
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet size={120} />
            </div>

            <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Para onde vai meu dinheiro</h3>
                    <UITooltip content="Veja como o valor do seu lote de faturas deste mês é dividido entre cada serviço.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500 font-medium">Composição do ciclo atual</p>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Nenhuma fatura lançada neste mês.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-h-[200px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                            <span className="text-2xl font-black text-gray-900">{format(totalCurrentMonth)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
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
                                                    <div className="text-lg">{format(item.value)}</div>
                                                    <div className="text-emerald-400">
                                                        {((item.value / totalCurrentMonth) * 100).toFixed(0)}% do lote
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-50 pt-6">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
