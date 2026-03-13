"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';

interface CobrancasHistoryStackedBarProps {
    data: {
        month: string;
        Pagas: number;
        Pendentes: number;
        Atrasadas: number;
    }[];
}

export function CobrancasHistoryStackedBar({ data }: CobrancasHistoryStackedBarProps) {
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Histórico de Inadimplência</h3>
                    <UITooltip content="Volume de cobranças nos últimos meses, separadas por status. Permite identificar tendências de atraso ou melhora no recebimento.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500">Últimos {data.length} meses</p>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Sem dados históricos suficientes.</p>
                </div>
            ) : (
                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 min-w-[150px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
                                                    {label}
                                                </p>
                                                <div className="space-y-2">
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-xs font-bold text-gray-500">{entry.name}</span>
                                                            </div>
                                                            <span className="text-xs font-black" style={{ color: entry.color }}>
                                                                {entry.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ top: -30, right: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                            <Bar dataKey="Pagas" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
                            <Bar dataKey="Pendentes" stackId="a" fill="#f5b11d" radius={[0, 0, 0, 0]} barSize={32} />
                            <Bar dataKey="Atrasadas" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
