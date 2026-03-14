"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { HelpCircle, Timer } from 'lucide-react';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';

interface PaymentVelocityChartProps {
    data: {
        label: string;
        count: number;
        dayOffset: number;
    }[];
}

export function PaymentVelocityChart({ data }: PaymentVelocityChartProps) {
    const totalPayments = data.reduce((sum, item) => sum + item.count, 0);
    const hasData = totalPayments > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Meu Ritmo de Pagamento</h3>
                            <UITooltip content="Veja quão rápido você costuma pagar suas faturas após o vencimento. Manter o ritmo ajuda na saúde dos seus grupos!">
                                <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                                    <HelpCircle size={16} />
                                </button>
                            </UITooltip>
                        </div>
                        <p className="text-xs text-gray-500">Minha agilidade em quitar compromissos</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                        <Timer size={20} />
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-400 font-medium">Ainda não temos dados sobre seu ritmo de pagamento.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={false} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-gray-900 text-white p-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10">
                                                <div className="uppercase tracking-wider mb-1 opacity-60">Pago {item.label}</div>
                                                <div className="text-lg">{item.count} pagamentos</div>
                                                <div className="text-gray-400">
                                                    {((item.count / totalPayments) * 100).toFixed(1)}% do total
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine x="No dia" stroke="#3b82f6" strokeDasharray="3 3" />
                            <Bar
                                dataKey="count"
                                radius={[6, 6, 0, 0]}
                                barSize={20}
                            >
                                {data.map((entry, index) => {
                                    let fill = '#94a3b8'; // Neutro
                                    if (entry.dayOffset < 0) fill = '#10b981'; // Adiantado
                                    if (entry.dayOffset === 0) fill = '#3b82f6'; // No dia
                                    if (entry.dayOffset > 0) fill = '#f59e0b'; // Atraso leve
                                    if (entry.dayOffset > 3) fill = '#ef4444'; // Atraso crítico

                                    return <Cell key={`cell-${index}`} fill={fill} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-tighter text-gray-400 border-t border-gray-50 pt-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Antecipado</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> No dia</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Um pouco depois</span>
            </div>
        </div>
    );
}
