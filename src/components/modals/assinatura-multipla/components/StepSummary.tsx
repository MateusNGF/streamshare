"use client";

import { useMemo } from "react";
import { Calendar, CheckCircle, Info } from "lucide-react";
import { parseLocalDate, gerarCiclosRetroativos, escolherProximoDiaVencimento, calcularDataVencimentoPadrao } from "@/lib/financeiro-utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Tooltip } from "@/components/ui/Tooltip";
import { StreamingOption, ParticipanteOption, SelectedStreaming } from "../types";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FrequenciaPagamento } from "@prisma/client";

// Sub-components
import { SummaryKPIs } from "./summary/SummaryKPIs";
import { ServiceConfigTable } from "./summary/ServiceConfigTable";
import { RetroactiveCyclesGrid } from "./summary/RetroactiveCyclesGrid";
import { BillingPreviewTable } from "./summary/BillingPreviewTable";
import { MembersList } from "./summary/MembersList";

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
    financialAnalysis: {
        receitaMensalTotal: number;
        custoMensalTotal: number;
        lucroLiquidoMensal: number;
        totalProximaFatura: number;
        margemLucro: number;
        totalAssinaturas: number;
        isPastDate: boolean;
        cobrancasProjetadas: any[];
    };
    diasVencimento?: number[];
    onUpdateConfig?: (id: number, field: keyof SelectedStreaming, value: any) => void;
    retroactivePaidIndices?: number[];
    onRetroactivePaidIndicesChange?: (indices: number[]) => void;
}

export function StepSummary({
    selectedStreamings,
    selectedParticipants,
    configurations,
    dataInicio,
    onDataInicioChange,
    primeiroCicloPago,
    onPrimeiroCicloChange,
    financialAnalysis,
    diasVencimento = [],
    onUpdateConfig,
    retroactivePaidIndices = [],
    onRetroactivePaidIndicesChange
}: StepSummaryProps) {
    const { format } = useCurrency();

    const totalSlots = useMemo(() => {
        return selectedParticipants.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    }, [selectedParticipants]);

    const ciclosRetroativos = useMemo(() => {
        if (!dataInicio || !financialAnalysis.isPastDate) return [];
        const streaming = selectedStreamings[0];
        if (!streaming) return [];

        return gerarCiclosRetroativos({
            dataInicio: parseLocalDate(dataInicio),
            frequencia: configurations.get(streaming.id)?.frequencia || FrequenciaPagamento.mensal,
            valorMensal: configurations.get(streaming.id)?.valor ? parseFloat(configurations.get(streaming.id)!.valor) : 0,
            diasVencimento
        });
    }, [dataInicio, financialAnalysis.isPastDate, selectedStreamings, configurations, diasVencimento]);

    const handleToggleRetroactive = (index: number) => {
        if (!onRetroactivePaidIndicesChange) return;
        const newIndices = retroactivePaidIndices.includes(index)
            ? retroactivePaidIndices.filter(i => i !== index)
            : [...retroactivePaidIndices, index];
        onRetroactivePaidIndicesChange(newIndices);
    };

    const nextInvoiceDate = useMemo(() => {
        return diasVencimento && diasVencimento.length > 0
            ? escolherProximoDiaVencimento(diasVencimento, parseLocalDate(dataInicio)).toLocaleDateString('pt-BR')
            : calcularDataVencimentoPadrao(parseLocalDate(dataInicio)).toLocaleDateString('pt-BR');
    }, [diasVencimento, dataInicio]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-4">

            {/* 1. COMPACT KPI BAR */}
            <SummaryKPIs
                receitaTotal={format(financialAnalysis.receitaMensalTotal)}
                custoTotal={format(financialAnalysis.custoMensalTotal)}
                lucroLiquido={format(financialAnalysis.lucroLiquidoMensal)}
                margemLucro={financialAnalysis.margemLucro}
                totalFaturas={financialAnalysis.totalAssinaturas}
                valorProximaFatura={format(financialAnalysis.totalProximaFatura)}
                dataVencimento={nextInvoiceDate}
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
                title="Configurações Operacionais"
                description="Defina a data de início e o status de pagamento do ciclo atual."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <OptionCard
                    icon={<Calendar size={18} />}
                    label="Data de Início"
                    description="As cobranças retroativas e pró-rata serão calculadas a partir desta data."
                    tooltip="Define a partir de quando o acesso foi liberado para calcular cobranças retroativas."
                >
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => onDataInicioChange(e.target.value)}
                        className="w-full mt-2 bg-transparent border-0 border-b-2 border-primary/20 focus:ring-0 focus:border-primary px-0 py-1 text-sm font-bold transition-all"
                    />
                </OptionCard>

                <OptionCard
                    icon={<CheckCircle size={18} />}
                    label="Lançamento Inicial"
                    description="O ciclo atual/pró-rata já foi quitado?"
                    tooltip="Indica se o usuário já pagou o valor inicial (pro-rata ou mês atual) fora do sistema."
                >
                    <div className="flex items-center gap-2 mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={primeiroCicloPago}
                                onChange={(e) => onPrimeiroCicloChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-2 text-xs font-black text-gray-700 uppercase">{primeiroCicloPago ? 'Já foi Pago' : 'Lançar como Pendente'}</span>
                        </label>
                    </div>
                </OptionCard>
            </div>

            {/* 4. RETROACTIVE CYCLES */}
            <RetroactiveCyclesGrid
                ciclos={ciclosRetroativos}
                paidIndices={retroactivePaidIndices}
                onToggle={handleToggleRetroactive}
                formatCurrency={format}
            />

            {/* 5. BILLING PREVIEW SECTION */}
            <BillingPreviewTable
                projections={financialAnalysis.cobrancasProjetadas}
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
