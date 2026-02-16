"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, HelpCircle } from 'lucide-react';
import { EmptyChartState } from '../EmptyChartState';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';

interface RevenueDistributionChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    currencyCode?: string;
    onViewStreamings?: () => void;
}

export function RevenueDistributionChart({ data, currencyCode = 'BRL', onViewStreamings }: RevenueDistributionChartProps) {
    const hasData = data && data.length > 0 && data.some(d => d.value > 0);

    // Sort data by value for better visual organization
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currencyCode }).format(val);

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Distribuição de Receita</h3>
                    <UITooltip content="Parcela da receita total gerada por cada serviço de streaming cadastrado.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500">Por serviço de streaming</p>
            </div>

            {!hasData ? (
                <EmptyChartState
                    icon={BarChart3}
                    title="Distribuição por serviço"
                    description="Aqui você verá quanto cada serviço contribui para a sua receita total."
                    actionLabel="Ver streamings"
                    onAction={onViewStreamings}
                    className="border-none bg-transparent min-h-[200px]"
                />
            ) : (
                <>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sortedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sortedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-gray-900 text-white p-3 rounded-2xl text-xs font-bold shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                        <span className="opacity-80 uppercase tracking-wider">{item.name}</span>
                                                    </div>
                                                    <div className="text-base">
                                                        {formatCurrency(item.value)}
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

                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gray-50 pt-4">
                        {sortedData.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="font-bold text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-black text-gray-900">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

