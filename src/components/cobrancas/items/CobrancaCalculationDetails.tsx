"use client";

import { Calculator, CheckCircle2 } from "lucide-react";
import { getDaysInMonth, differenceInDays } from "date-fns";

interface CobrancaCalculationDetailsProps {
    cobranca: any;
    format: (value: number) => string;
}

/**
 * Área de Transparência Algorítmica: Detalhamento do cálculo pro-rata.
 * Seguindo as orientações de UX Psicológica para reduzir a ansiedade de incerteza.
 * 
 * SOLID: SRP (Single Responsibility Principle) - Este componente cuida apenas 
 * da exibição visual e explicação do cálculo financeiro.
 */
export function CobrancaCalculationDetails({ cobranca, format }: CobrancaCalculationDetailsProps) {
    const valorMensal = Number(cobranca.assinatura.valor);
    const dataInicio = new Date(cobranca.periodoInicio);
    const dataFim = new Date(cobranca.periodoFim);
    const diasNoMes = getDaysInMonth(dataInicio);
    const diasCobertos = Math.max(1, differenceInDays(dataFim, dataInicio));

    // Regra de tolerância do financeiro-utils.ts (28 a 31 dias = mês cheio)
    const isFullMonth = diasCobertos >= 28 && diasCobertos <= 31;
    const isProRata = diasCobertos < 28 || Number(cobranca.valor) !== valorMensal;

    if (!isProRata && !isFullMonth) return null;

    return (
        <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-500">
                <Calculator size={16} className="text-primary" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transparência Algorítmica</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] text-gray-400 uppercase tracking-widest">
                            <th className="font-black pb-1 px-1">Componente do Cálculo</th>
                            <th className="font-black pb-1 px-1 text-right">Valor / Info</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="bg-white rounded-xl shadow-sm">
                            <td className="py-2.5 px-4 rounded-l-xl border-y border-l border-gray-100">Valor Mensal Base</td>
                            <td className="py-2.5 px-4 rounded-r-xl border-y border-r border-gray-100 text-right font-bold text-gray-900">{format(valorMensal)}</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4">Dias no Mês ({dataInicio.toLocaleDateString('pt-BR', { month: 'long' })})</td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-gray-700">{diasNoMes} dias</td>
                        </tr>
                        <tr className="bg-primary/5 rounded-xl">
                            <td className="py-2.5 px-4 rounded-l-xl border-y border-l border-primary/10 font-bold text-primary">Dias Proporcionais Cobertos</td>
                            <td className="py-2.5 px-4 rounded-r-xl border-y border-r border-primary/10 text-right font-mono font-black text-primary">{diasCobertos} dias</td>
                        </tr>
                        {isFullMonth && (
                            <tr>
                                <td colSpan={2} className="py-1 px-4 text-[10px] text-green-600 font-bold italic flex items-center gap-1">
                                    <CheckCircle2 size={10} />
                                    Regra de Tolerância aplicada (Mês Cheio)
                                </td>
                            </tr>
                        )}
                        <tr className="bg-gray-900 text-white rounded-xl shadow-lg">
                            <td className="py-3.5 px-4 rounded-l-xl font-bold">Valor Final do Ciclo</td>
                            <td className="py-3.5 px-4 rounded-r-xl text-right font-black text-lg">{format(Number(cobranca.valor))}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                    <strong>Como calculamos?</strong> Dividimos o valor mensal pelos dias do mês corrente e multiplicamos pelos dias de uso efetivo no período. Isso garante que você pague exatamente pelo tempo que teve acesso.
                </p>
            </div>
        </div>
    );
}
