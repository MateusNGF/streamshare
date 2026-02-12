"use client";

import { Calendar, History } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface ChargesHistoryTableProps {
    charges: any[];
}

export function ChargesHistoryTable({ charges }: ChargesHistoryTableProps) {
    const { format } = useCurrency();

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <History size={12} /> Histórico Recente
                </h4>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider">Período</th>
                                <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                                <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                                <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {charges?.slice(0, 5).map((cob) => {
                                const isPaid = cob.status === 'pago';
                                const isOverdue = cob.status === 'atrasado';

                                return (
                                    <tr key={cob.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 uppercase">
                                                    {new Date(cob.periodoInicio).toLocaleString('pt-BR', { month: 'short' })}
                                                    - {new Date(cob.periodoFim).toLocaleString('pt-BR', { month: 'short', year: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">Ref. {new Date(cob.periodoInicio).getFullYear()}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-gray-300" />
                                                <span className={cn("font-bold text-sm", isOverdue && !isPaid ? "text-red-500" : "text-gray-700")}>
                                                    {new Date(cob.dataVencimento).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-black text-gray-900 text-right text-sm">
                                            {format(Number(cob.valor))}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                <StatusBadge status={cob.status} className="scale-75" />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!charges || charges.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
