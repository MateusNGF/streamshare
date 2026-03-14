"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { HelpCircle, User } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';
import { useCurrency } from '@/hooks/useCurrency';

interface ParticipantHistoryLineProps {
    data: {
        month: string;
        key: string;
        status: string;
        valor: number;
    }[];
}

export function ParticipantHistoryLine({ data }: ParticipantHistoryLineProps) {
    const { format } = useCurrency();

    const statusMap: Record<string, number> = {
        'pago': 2,
        'aguardando_aprovacao': 1.5,
        'pendente': 1,
        'atrasado': 0.5,
        'cancelado': 0,
        'n/a': 0
    };

    const chartData = data.map(d => ({
        ...d,
        score: statusMap[d.status] || 0
    }));

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Dossiê de Pagamento</h3>
                            <UITooltip content="Comportamento histórico de pagamentos deste participante nos últimos meses.">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500 text-primary font-bold">Histórico individual de confiabilidade</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        />
                        <YAxis hide domain={[0, 2.5]} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    const statusColors: any = {
                                        'pago': 'text-emerald-500',
                                        'atrasado': 'text-red-500',
                                        'pendente': 'text-amber-500',
                                        'aguardando_aprovacao': 'text-blue-500'
                                    };
                                    return (
                                        <div className="bg-gray-900 text-white p-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10">
                                            <div className="uppercase tracking-wider mb-1 opacity-60">{item.month}</div>
                                            <div className="text-lg">{format(item.valor)}</div>
                                            <div className={`${statusColors[item.status] || 'text-gray-400'} uppercase`}>
                                                {item.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-tighter text-gray-400 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Excelente</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Em Validação</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Pendente</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Crítico</span>
                </div>
            </div>
        </div>
    );
}
