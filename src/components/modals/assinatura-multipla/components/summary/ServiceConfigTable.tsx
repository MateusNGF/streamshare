"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FrequenciaPagamento } from "@prisma/client";
import { Info } from "lucide-react";
import { StreamingOption, SelectedStreaming } from "../../types";

interface ServiceConfigTableProps {
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    totalSlots: number;
    formatCurrency: (val: number) => string;
    onUpdateConfig?: (id: number, field: keyof SelectedStreaming, value: any) => void;
}

export function ServiceConfigTable({
    selectedStreamings,
    configurations,
    totalSlots,
    formatCurrency,
    onUpdateConfig
}: ServiceConfigTableProps) {
    return (
        <div className="overflow-x-auto custom-scrollbar mb-10">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr>
                        <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 font-black">Serviço</th>
                        <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-center font-black">Frequência</th>
                        <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-right font-black">Valor Unitário</th>
                        <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-right font-black">Total Faturamento</th>
                        <th className="px-2 py-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 text-right font-black">
                            <div className="flex items-center justify-end gap-1.5 font-black">
                                Lucro Estimado
                                <Tooltip content="Diferença entre o valor cobrado e o custo base do serviço por vaga.">
                                    <Info size={12} className="text-gray-300 cursor-help" />
                                </Tooltip>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {selectedStreamings.map(s => {
                        const config = configurations.get(s.id);
                        const price = Number(config?.valor || 0);
                        const cost = s.valorIntegral / s.limiteParticipantes;

                        return (
                            <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-2 py-4 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <StreamingLogo
                                            name={s.nome}
                                            color={s.cor}
                                            iconeUrl={s.iconeUrl}
                                            size="xs"
                                            rounded="lg"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-gray-800 tracking-tight leading-none">{s.nome}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Vagas: {totalSlots}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-center">
                                    {onUpdateConfig ? (
                                        <Select
                                            value={config?.frequencia}
                                            onValueChange={(val) => onUpdateConfig(s.id, 'frequencia', val)}
                                        >
                                            <SelectTrigger className="h-8 text-[11px] font-black w-32 mx-auto bg-gray-50/50 border-gray-100 rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={FrequenciaPagamento.mensal}>Mensal</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.trimestral}>Trimestral</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.semestral}>Semestral</SelectItem>
                                                <SelectItem value={FrequenciaPagamento.anual}>Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="secondary" className="text-[10px] font-black uppercase px-2 py-0.5">
                                            {config?.frequencia || 'mensal'}
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-right">
                                    {onUpdateConfig ? (
                                        <div className="w-28 ml-auto">
                                            <CurrencyInput
                                                value={price}
                                                onValueChange={(val) => onUpdateConfig(s.id, 'valor', val?.toString() || '0')}
                                                className="h-8 text-[12px] px-2 py-0 bg-gray-50/50 border-gray-100 rounded-lg font-black text-right"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-[13px] font-black text-gray-900">{formatCurrency(price)}</span>
                                    )}
                                </td>
                                <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-right text-[13px] font-black text-gray-900 whitespace-nowrap">
                                    {formatCurrency(price * totalSlots)}
                                </td>
                                <td className="px-2 py-4 border-b border-gray-50 last:border-0 text-right whitespace-nowrap">
                                    <span className="text-[11px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                        +{formatCurrency((price - cost) * totalSlots)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
