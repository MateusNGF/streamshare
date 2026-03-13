"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { HelpCircle, TrendingUp } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface FaturasRevenueHistoryProps {
    data: {
        month: string;
        realizado: number;
    }[];
}

export function FaturasRevenueHistory({ data }: FaturasRevenueHistoryProps) {
    const { format } = useCurrency();
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <TrendingUp size={120} />
            </div>

            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Evolução de Pagamentos</h3>
                    <UITooltip content="Acompanhe o volume financeiro pago ao longo do ano. Mantém você engajado no crescimento das suas assinaturas.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500">Histórico de quitação</p>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Sem histórico de pagamentos.</p>
                </div>
            ) : (
                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[150px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    {label}
                                                </p>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Total Pago</span>
                                                    <span className="text-xl font-black">
                                                        {format(payload[0].value as number)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="realizado"
                                stroke="#8b5cf6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorRealizado)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
