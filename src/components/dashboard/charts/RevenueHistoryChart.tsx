"use client";

import {
    ComposedChart,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface RevenueHistoryChartProps {
    data: any[];
    currencyCode?: string;
}

function CustomTooltip({ active, payload, currencyCode = 'BRL' }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 min-w-[200px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
                    Análise Mensal
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-gray-500">Receita</span>
                        </div>
                        <span className="text-sm font-black text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currencyCode }).format(payload.find((p: any) => p.dataKey === 'receita')?.value || 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-gray-500">Novos Membros</span>
                        </div>
                        <span className="text-sm font-black text-blue-600">
                            + {payload.find((p: any) => p.dataKey === 'novosMembros')?.value || 0}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

export function RevenueHistoryChart({ data, currencyCode }: RevenueHistoryChartProps) {
    return (
        <div className="w-full bg-white/70 backdrop-blur-xl p-6 md:p-10 rounded-[40px] border border-white/20 shadow-sm overflow-hidden animate-scale-in transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Evolução da Receita & Crescimento</h3>
                    <p className="text-sm text-gray-500 font-medium">Histórico semestral de faturamento e novos assinantes</p>
                </div>
                <div className="flex items-center gap-6 bg-gray-50 p-3 px-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> <span className="hidden sm:inline">Receita Mensal</span><span className="sm:hidden">Receita</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /> <span className="hidden sm:inline">Novos Assinantes</span><span className="sm:hidden">Novos</span></div>
                </div>
            </div>
            <div className="h-[400px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <defs>
                            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6d28d9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 600 }}
                            dy={15}
                        />
                        <YAxis hide />
                        <Tooltip
                            content={<CustomTooltip currencyCode={currencyCode} />}
                            cursor={{ stroke: '#6d28d9', strokeWidth: 1, strokeDasharray: '6 6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="receita"
                            stroke="#6d28d9"
                            strokeWidth={5}
                            fillOpacity={1}
                            fill="url(#colorReceita)"
                            animationDuration={2000}
                        />
                        <Bar
                            dataKey="novosMembros"
                            fill="#60a5fa"
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                            animationDuration={2000}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
