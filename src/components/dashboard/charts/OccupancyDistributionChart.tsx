"use client";

import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { LayoutPanelLeft, HelpCircle } from 'lucide-react';
import { EmptyChartState } from '../EmptyChartState';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';

interface OccupancyDistributionChartProps {
    data: any[];
    onAddStreaming?: () => void;
}

export function OccupancyDistributionChart({ data, onAddStreaming }: OccupancyDistributionChartProps) {
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Taxa de Ocupação</h3>
                    <UITooltip content="Acompanhe a lotação de cada serviço. Valores altos indicam boa ocupação, valores baixos indicam vagas ociosas.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500">Distribuição de vagas por streaming</p>
            </div>

            {!hasData ? (
                <EmptyChartState
                    icon={LayoutPanelLeft}
                    title="Nenhuma vaga para monitorar"
                    description="Crie seu primeiro streaming para começar a acompanhar a ocupação das vagas."
                    actionLabel="Criar streaming"
                    onAction={onAddStreaming}
                    className="border-none bg-transparent min-h-[200px]"
                />
            ) : (
                <div className="flex-1 min-h-[250px]">

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 700 }}
                                width={80}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-gray-900 text-white p-2 px-3 rounded-lg text-[10px] font-bold shadow-xl">
                                                {payload[0].value} / {payload[0].payload.vagas} vagas
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="ocupadas" radius={[0, 4, 4, 0]} barSize={12}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            {hasData && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                    {data.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-bold text-gray-600 truncate w-24">{item.name}</span>
                            </div>
                            <span className="font-black text-gray-400">{Math.round((item.ocupadas / item.vagas) * 100)}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
