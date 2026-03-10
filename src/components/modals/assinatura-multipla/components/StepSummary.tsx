"use client";

import { useMemo } from "react";
import { Calendar, CheckCircle, Info } from "lucide-react";
import { parseLocalDate, gerarCiclosRetroativos, escolherProximoDiaVencimento, calcularDataVencimentoPadrao } from "@/lib/financeiro-utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Tooltip } from "@/components/ui/Tooltip";
import { StreamingOption, ParticipanteOption, SelectedStreaming } from "../types";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FrequenciaPagamento } from "@prisma/client";
import { cn } from "@/lib/utils";

// Sub-components
import { SummaryKPIs } from "./summary/SummaryKPIs";
import { ServiceConfigTable } from "./summary/ServiceConfigTable";
import { RetroactiveCyclesGrid } from "./summary/RetroactiveCyclesGrid";
import { BillingPreviewTable } from "./summary/BillingPreviewTable";
import { MembersList } from "./summary/MembersList";
import { Switch } from "@/components/ui/Switch";

interface StepSummaryProps {
    selectedStreamings: StreamingOption[];
    selectedParticipants: ParticipanteOption[];
    configurations: Map<number, SelectedStreaming>;
    dataInicio: string;
    onDataInicioChange: (val: string) => void;
    cobrancaAutomatica: boolean;
    onCobrancaChange: (val: boolean) => void;
    primeiroCicloPago: boolean;
    onPrimeiroCicloChange: (val: boolean) => void;
    overloadedStreamings: StreamingOption[];
    financialAnalysis: any;
    diasVencimento: number[];
    onUpdateConfig: (streamingId: number, field: any, value: any) => void;
    retroactivePaidPeriods: Array<{ streamingId: number, index: number }>;
    onRetroactivePaidPeriodsChange: (periods: Array<{ streamingId: number, index: number }>) => void;
}

export function StepSummary({
    selectedStreamings,
    selectedParticipants,
    configurations,
    dataInicio,
    onDataInicioChange,
    cobrancaAutomatica,
    onCobrancaChange,
    primeiroCicloPago,
    onPrimeiroCicloChange,
    financialAnalysis,
    diasVencimento,
    onUpdateConfig,
    retroactivePaidPeriods,
    onRetroactivePaidPeriodsChange
}: StepSummaryProps) {
    const { format } = useCurrency();

    const totalSlots = useMemo(() => {
        return selectedParticipants.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    }, [selectedParticipants]);

    const formattedNextInvoiceDate = useMemo(() => {
        if (!financialAnalysis.proximoVencimento) return "Pendente";
        const date = new Date(financialAnalysis.proximoVencimento);
        return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleDateString('pt-BR');
    }, [financialAnalysis.proximoVencimento]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* 1. COMPACT KPI BAR */}
            <SummaryKPIs
                receitaTotal={format(financialAnalysis.receitaMensalTotal)}
                custoTotal={format(financialAnalysis.custoMensalTotal)}
                lucroLiquido={format(financialAnalysis.lucroLiquidoMensal)}
                margemLucro={financialAnalysis.margemLucro}
                totalFaturas={financialAnalysis.totalAssinaturas}
                valorProximaFatura={format(financialAnalysis.valorTotalLancamento)}
                dataVencimento={formattedNextInvoiceDate}
            />

            {/* 2. CONFIGURATION SECTION */}
            <SectionHeader
                title="Configurações e Valores"
                description="Revise os valores e frequências de pagamento para cada serviço selecionado."
            />
            <ServiceConfigTable
                selectedStreamings={selectedStreamings}
                configurations={configurations}
                totalSlots={totalSlots}
                formatCurrency={format}
                onUpdateConfig={onUpdateConfig}
            />

            {/* 3. OPERATIONAL INPUTS SECTION */}
            <SectionHeader
                title="Fluxo Financeiro"
                description="Determine como o sistema deve processar o faturamento inicial e futuro."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <OptionCard
                    icon={<Calendar size={16} />}
                    label="Data de Início"
                    description="A partir de quando o acesso e as cobranças começam a contar."
                >
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => onDataInicioChange(e.target.value)}
                        className="w-full bg-transparent border-0 border-b-2 border-primary/10 focus:ring-0 focus:border-primary px-0 py-1 text-sm font-bold transition-all"
                    />
                </OptionCard>

                <OptionCard
                    icon={<CheckCircle size={16} className={cn(primeiroCicloPago ? "text-emerald-500" : "text-gray-300")} />}
                    label="Lançamento Inicial"
                    description="Marque se os participantes já pagaram o ciclo atual (migração)."
                    tooltip="Se ativado, as faturas geradas hoje nascerão com status 'Pago'."
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">Ciclo atual já pago?</span>
                        <Switch
                            checked={primeiroCicloPago}
                            onCheckedChange={onPrimeiroCicloChange}
                        />
                    </div>
                </OptionCard>

                <OptionCard
                    icon={<CheckCircle size={16} className={cn(cobrancaAutomatica ? "text-emerald-500" : "text-gray-300")} />}
                    label="Cobrança Automática"
                    description="O sistema deve assumir que as faturas futuras sempre são pagas?"
                    tooltip="Ideal para sistemas integrados ou onde o recebimento é garantido externamente."
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">Faturas futuras pagas?</span>
                        <Switch
                            checked={cobrancaAutomatica}
                            onCheckedChange={onCobrancaChange}
                        />
                    </div>
                </OptionCard>
            </div>

            {/* 4. RETROACTIVE CYCLES */}
            {financialAnalysis.isPastDate && (
                <RetroactiveCyclesGrid
                    ciclos={financialAnalysis.cobrancasProjetadas.filter((p: any) => p.tipo === 'Retroativa')}
                    paidPeriods={retroactivePaidPeriods}
                    onToggle={(cycle) => {
                        const isMatch = (p: any) => p.streamingId === cycle.streamingId && p.index === cycle.index;
                        const exists = retroactivePaidPeriods.some(isMatch);
                        if (exists) {
                            onRetroactivePaidPeriodsChange(retroactivePaidPeriods.filter(p => !isMatch(p)));
                        } else {
                            onRetroactivePaidPeriodsChange([...retroactivePaidPeriods, { streamingId: cycle.streamingId, index: cycle.index }]);
                        }
                    }}
                    formatCurrency={format}
                />
            )}

            {/* 5. FUTURE BILLING PREVIEW */}
            <BillingPreviewTable
                projections={financialAnalysis.cobrancasProjetadas.filter((p: any) => p.tipo !== 'Retroativa')}
                totalSlots={totalSlots}
                formatCurrency={format}
            />

            {/* 6. PARTICIPANTS LIST */}
            <MembersList
                participants={selectedParticipants}
                totalSlots={totalSlots}
                receitaTotal={financialAnalysis.receitaMensalTotal}
                lucroTotal={financialAnalysis.lucroLiquidoMensal}
                formatCurrency={format}
            />
        </div>
    );
}

function OptionCard({ icon, label, description, tooltip, children }: { icon: React.ReactNode, label: string, description: string, tooltip?: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-primary group-hover:bg-primary/5 transition-colors">
                        {icon}
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">{label}</h4>
                </div>
                {tooltip && (
                    <Tooltip content={tooltip}>
                        <Info size={14} className="text-gray-300 hover:text-primary cursor-help transition-colors" />
                    </Tooltip>
                )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 mb-4 leading-relaxed">{description}</p>
            {children}
        </div>
    );
}
