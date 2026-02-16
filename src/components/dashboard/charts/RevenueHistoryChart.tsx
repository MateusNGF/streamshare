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

interface RevenueHistoryChartProps {
    data: any[];
}

function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">
                    Insight do Mês
                </p>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-xs font-bold text-gray-500">Receita</span>
                        <span className="text-sm font-black text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

export function RevenueHistoryChart({ data }: RevenueHistoryChartProps) {
    return (
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900">Evolução da Receita Estimada</h3>
                    <p className="text-xs text-gray-500">Acompanhamento financeiro mensal</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Receita</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Membros</div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6d28d9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#6d28d9', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="receita"
                            stroke="#6d28d9"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorReceita)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
