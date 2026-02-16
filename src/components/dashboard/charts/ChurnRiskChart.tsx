"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserMinus, HelpCircle } from 'lucide-react';
import { EmptyChartState } from '../EmptyChartState';
import { Tooltip as UITooltip } from '@/components/ui/Tooltip';

interface ChurnRiskChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    riskRate: number;
    onViewParticipants?: () => void;
}

export function ChurnRiskChart({ data, riskRate, onViewParticipants }: ChurnRiskChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = total > 0;

    // A cor do texto central depende do nível de risco
    const getRiskLabel = (rate: number) => {
        if (rate >= 50) return { label: "Crítico", color: "text-red-500" };
        if (rate >= 25) return { label: "Médio", color: "text-amber-500" };
        return { label: "Baixo", color: "text-emerald-500" };
    };

    const riskInfo = getRiskLabel(riskRate);

    return (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-full">
            <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Risco de Churn</h3>
                    <UITooltip content="Analisa o padrão de atrasos dos participantes. Um risco alto indica que o participante tem grandes chances de cancelar por inadimplência.">
                        <button className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <HelpCircle size={16} />
                        </button>
                    </UITooltip>
                </div>
                <p className="text-xs text-gray-500">Probabilidade de saída baseada em atrasos</p>
            </div>

            {!hasData ? (
                <EmptyChartState
                    icon={UserMinus}
                    title="Dados insuficientes"
                    description="O risco de churn será calculado conforme os pagamentos forem registrados."
                    actionLabel="Ver participantes"
                    onAction={onViewParticipants}
                    className="border-none bg-transparent min-h-[200px]"
                />
            ) : (
                <>
                    <div className="flex-1 min-h-[250px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-3xl font-black ${riskInfo.color}`}>{riskRate.toFixed(1)}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{riskInfo.label}</span>
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
                                                    {item.name}: {item.value} assinaturas
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
