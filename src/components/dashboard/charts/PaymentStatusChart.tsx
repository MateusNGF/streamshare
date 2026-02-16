"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CreditCard } from 'lucide-react';
import { EmptyChartState } from '../EmptyChartState';

interface PaymentStatusChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    onManageSubscriptions?: () => void;
}

export function PaymentStatusChart({ data, onManageSubscriptions }: PaymentStatusChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = total > 0;
    const paidItem = data.find(d => d.name === 'Pago');
    const healthPercentage = paidItem && total > 0 ? Math.round((paidItem.value / total) * 100) : 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-full">
            <div className="mb-6 relative z-10">
                <h3 className="font-bold text-gray-900">Saúde dos Pagamentos</h3>
                <p className="text-xs text-gray-500">Status das cobranças (últimos 90 dias)</p>
            </div>

            {!hasData ? (
                <EmptyChartState
                    icon={CreditCard}
                    title="Sem cobranças no momento"
                    description="O status dos seus pagamentos aparecerá aqui quando as primeiras cobranças forem geradas."
                    actionLabel="Ver assinaturas"
                    onAction={onManageSubscriptions}
                    className="border-none bg-transparent min-h-[200px]"
                />
            ) : (
                <>
                    <div className="flex-1 min-h-[250px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-gray-900">{healthPercentage}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aproveitamento</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-gray-900 text-white p-2 px-3 rounded-xl text-[10px] font-bold shadow-xl">
                                                    {item.name}: {item.value} cobranças
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                        {data.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <span className="text-lg font-bold text-gray-900">{item.value}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

