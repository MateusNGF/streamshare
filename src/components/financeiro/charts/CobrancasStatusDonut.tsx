"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HelpCircle, PieChart as PieChartIcon } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface CobrancasStatusDonutProps {
    data: {
        name: string;
        value: number;
        amount: number;
        color: string;
        statusKey?: string; // Chave original para filtro
    }[];
    totalExpected: number;
    monthLabel?: string;
    onSliceClick?: (status: string) => void;
}

export function CobrancasStatusDonut({ data, totalExpected, monthLabel, onSliceClick }: CobrancasStatusDonutProps) {
    const { format } = useCurrency();
    const totalCount = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = totalCount > 0;

    const paidItem = data.find(d => d.name === 'Pagas' || d.statusKey === 'pago');
    const healthPercentage = paidItem && totalCount > 0 ? Math.round((paidItem.value / totalCount) * 100) : 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Status do Ciclo</h3>
                            <UITooltip content="Proporção de cobranças por status no período selecionado. O centro exibe o valor total previsto.">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                            Análise de <span className="text-primary font-bold">{monthLabel ? monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1) : "Janeiro de 2024"}</span>
                        </p>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                        <PieChartIcon size={32} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">Sem dados no período</h4>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px]">Nenhuma cobrança gerada ou encontrada para os filtros atuais.</p>
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
                                    className="outline-none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            className={cn(
                                                "hover:opacity-80 transition-opacity cursor-pointer outline-none focus:outline-none",
                                                onSliceClick && "cursor-pointer"
                                            )}
                                            onClick={() => {
                                                if (onSliceClick && entry.statusKey) {
                                                    onSliceClick(entry.statusKey);
                                                }
                                            }}
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
                                                    {onSliceClick && (
                                                        <div className="mt-2 pt-2 border-t border-white/10 text-primary-400">
                                                            Clique para filtrar faturas
                                                        </div>
                                                    )}
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
                            <button
                                key={index}
                                className={cn(
                                    "flex flex-col items-center group transition-transform hover:scale-105",
                                    !onSliceClick && "pointer-events-none"
                                )}
                                onClick={() => item.statusKey && onSliceClick?.(item.statusKey)}
                            >
                                <span className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{item.value}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-gray-600 transition-colors">{item.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
