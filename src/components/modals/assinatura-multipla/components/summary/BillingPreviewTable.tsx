"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface Projection {
    tipo: string;
    streaming: string;
    periodo: string;
    vencimento: string;
    valor: number;
}

interface BillingPreviewTableProps {
    projections: Projection[];
    totalSlots: number;
    formatCurrency: (val: number) => string;
}

export function BillingPreviewTable({
    projections,
    totalSlots,
    formatCurrency
}: BillingPreviewTableProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const totalInicialAcumulado = projections.reduce((acc, c) => acc + (c.valor * totalSlots), 0);

    return (
        <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <SectionHeader
                title="Lançamentos Futuros"
                description={`Estimativa de Pro-rata e primeiras mensalidades para as ${totalSlots} vaga(s).`}
                rightElement={
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] sm:text-[11px] font-black transition-all border border-gray-100 shrink-0"
                    >
                        {isCollapsed ? (
                            <>
                                <span className="hidden sm:inline">Mostrar Preview</span>
                                <span className="sm:hidden">Expandir</span>
                                <ChevronDown size={14} />
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Ocultar Preview</span>
                                <span className="sm:hidden">Recolher</span>
                                <ChevronUp size={14} />
                            </>
                        )}
                    </button>
                }
            />

            {!isCollapsed && (
                <div className="overflow-x-auto animate-in zoom-in-95 duration-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">Tipo</th>
                                <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">Serviço</th>
                                <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-center">Período</th>
                                <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-center">Vencimento</th>
                                <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Valor Projetado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projections.map((c, i) => (
                                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-2 py-4 border-b border-gray-50 last:border-0">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${c.tipo === 'Retroativa' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {c.tipo}
                                        </span>
                                    </td>
                                    <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-[12px] font-black text-gray-700">
                                        {c.streaming}
                                    </td>
                                    <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-center text-[11px] font-bold text-gray-500">
                                        {c.periodo}
                                    </td>
                                    <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-center text-[12px] font-black text-gray-900 uppercase">
                                        {c.vencimento}
                                    </td>
                                    <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-right text-[12px] font-black text-gray-900 whitespace-nowrap">
                                        {formatCurrency(c.valor * totalSlots)}
                                    </td>
                                </tr>
                            ))}
                            {projections.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-2 py-12 text-center text-gray-400 text-[12px] font-bold uppercase italic border-b border-gray-50">
                                        Nenhuma cobrança projetada para as configurações atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {projections.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="px-2 py-6 text-[11px] font-black uppercase text-primary text-right">Total Inicial Acumulado</td>
                                    <td className="px-2 py-6 text-right text-lg font-black text-primary">
                                        {formatCurrency(totalInicialAcumulado)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
}
