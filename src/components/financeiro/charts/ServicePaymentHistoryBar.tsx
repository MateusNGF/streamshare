"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { History, Search } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface ServicePaymentHistoryBarProps {
    data: {
        month: string;
        pago: number;
        status?: string;
    }[];
}

export function ServicePaymentHistoryBar({ data }: ServicePaymentHistoryBarProps) {
    const { format } = useCurrency();
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <History size={120} />
            </div>

            <div className="mb-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Histórico de Mensalidades</h3>
                        </div>
                        <p className="text-xs text-gray-500">Evolução do valor investido neste serviço</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <Search size={20} />
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Nenhum histórico disponível para este filtro.</p>
                </div>
            ) : (
                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                                tickFormatter={(val) => format(val)}
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
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-primary uppercase">Valor Pago</span>
                                                    <span className="text-xl font-black text-gray-900">
                                                        {format(payload[0].value as number)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="pago"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#6d28d9" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
