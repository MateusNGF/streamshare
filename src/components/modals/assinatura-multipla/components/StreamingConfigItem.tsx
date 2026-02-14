"use client";

import { FrequenciaPagamento } from "@prisma/client";
import { useCurrency } from "@/hooks/useCurrency";
import { useBillingCalculations } from "@/hooks/useBillingCalculations";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { INTERVALOS_MESES } from "@/lib/financeiro-utils";
import { ProfitBadge } from "./ProfitBadge";
import { StreamingOption, SelectedStreaming } from "../types";

export function StreamingConfigItem({
    streaming,
    config,
    onUpdate
}: {
    streaming: StreamingOption;
    config?: SelectedStreaming;
    onUpdate: (id: number, field: keyof SelectedStreaming, value: any) => void;
}) {
    const { format, currencyInfo } = useCurrency();

    const billing = useBillingCalculations({
        valorIntegral: streaming.valorIntegral,
        limiteParticipantes: streaming.limiteParticipantes,
        valorAtual: config?.valor || 0,
        frequencia: config?.frequencia || FrequenciaPagamento.mensal
    });

    if (!config) return null;

    return (
        <div className="border-2 border-gray-200 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 mb-4">
                <StreamingLogo
                    name={streaming.nome}
                    color={streaming.cor}
                    iconeUrl={streaming.iconeUrl}
                    size="md"
                />
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900">
                        {streaming.apelido || streaming.nome}
                    </h4>
                    {streaming.apelido && (
                        <p className="text-xs text-muted-foreground">{streaming.catalogoNome}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 min-h-[20px] mb-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            Frequência de Cobrança
                        </label>
                    </div>
                    <Select
                        value={config.frequencia}
                        onValueChange={(value) => onUpdate(streaming.id, 'frequencia', value as FrequenciaPagamento)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(!streaming.frequenciasHabilitadas || streaming.frequenciasHabilitadas.includes('mensal')) && (
                                <SelectItem value={FrequenciaPagamento.mensal}>Mensal</SelectItem>
                            )}
                            {streaming.frequenciasHabilitadas?.includes('trimestral') && (
                                <SelectItem value={FrequenciaPagamento.trimestral}>Trimestral</SelectItem>
                            )}
                            {streaming.frequenciasHabilitadas?.includes('semestral') && (
                                <SelectItem value={FrequenciaPagamento.semestral}>Semestral</SelectItem>
                            )}
                            {streaming.frequenciasHabilitadas?.includes('anual') && (
                                <SelectItem value={FrequenciaPagamento.anual}>Anual</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {config.frequencia !== 'mensal' && (
                        <p className="text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50 w-fit mt-1.5">
                            Ciclo: {format(billing.totalCiclo)} a cada {INTERVALOS_MESES[config.frequencia]} meses
                        </p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 min-h-[20px] mb-1.5 pr-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            Valor Mensal ({currencyInfo.symbol})
                        </label>
                        <ProfitBadge amount={billing.lucroMensal} />
                    </div>
                    <CurrencyInput
                        value={config.valor}
                        onValueChange={(val) => onUpdate(streaming.id, 'valor', val?.toString() || '')}
                        placeholder={billing.custoBase.toFixed(2)}
                    />
                    <p className="text-[9px] text-gray-400 font-medium mt-1.5 text-right">Custo base: {format(billing.custoBase)}</p>
                </div>
            </div>
        </div>
    );
}
