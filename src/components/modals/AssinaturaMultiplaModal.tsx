"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Spinner } from "@/components/ui/Spinner";
import { FrequenciaPagamento } from "@prisma/client";
import { INTERVALOS_MESES, calcularCustoBase, calcularTotalCiclo, arredondarMoeda } from "@/lib/financeiro-utils";
import { Prisma } from "@prisma/client";
import { useCurrency } from "@/hooks/useCurrency";
import { Check, ChevronLeft, Search, Users, X, Calendar, Wallet, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useBillingCalculations } from "@/hooks/useBillingCalculations";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

// --- Types ---

interface StreamingOption {
    id: number;
    nome: string;
    apelido?: string;
    catalogoNome?: string;
    valorIntegral: number;
    limiteParticipantes: number;
    ocupados: number;
    cor: string;
    iconeUrl?: string | null;
    frequenciasHabilitadas: string;
}

interface ParticipanteOption {
    id: number;
    nome: string;
    whatsappNumero: string;
}

interface SelectedStreaming {
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: string;
}

interface AssinaturaMultiplaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        participanteIds: number[];
        assinaturas: Array<{
            streamingId: number;
            frequencia: FrequenciaPagamento;
            valor: number;
        }>;
        dataInicio: string;
        cobrancaAutomaticaPaga?: boolean;
    }) => void;
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    loading: boolean;
}

// --- Constants ---

enum ModalStep {
    STREAMING = 1,
    VALUES = 2,
    PARTICIPANTS = 3,
    SUMMARY = 4
}

// --- Sub-components ---

function StepStreamings({
    streamings,
    selectedIds,
    onToggle,
    searchTerm,
    onSearchChange
}: {
    streamings: StreamingOption[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
}) {
    const { format } = useCurrency();
    // Local filtering
    const filtered = useMemo(() => {
        if (!searchTerm) return streamings;
        return streamings.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [streamings, searchTerm]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Selecione os Streamings</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Escolha os serviços de streaming que deseja adicionar
                    {selectedIds.size > 0 && (
                        <span className="ml-2 text-primary font-bold">
                            ({selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''})
                        </span>
                    )}
                </p>
            </div>

            {streamings.length > 4 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar streaming..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filtered.map(streaming => {
                    const isSelected = selectedIds.has(streaming.id);
                    const isFull = streaming.ocupados >= streaming.limiteParticipantes;

                    return (
                        <button
                            key={streaming.id}
                            onClick={() => !isFull && onToggle(streaming.id)}
                            disabled={isFull}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                } ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                            <StreamingLogo
                                name={streaming.nome}
                                color={streaming.cor}
                                iconeUrl={streaming.iconeUrl}
                                size="lg"
                                className="shadow-sm"
                            />
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{streaming.nome}</h4>
                            <p className="text-xs text-gray-500">
                                {streaming.ocupados}/{streaming.limiteParticipantes} vagas
                                {isFull && " • LOTADO"}
                            </p>
                            <p className="text-xs font-bold text-primary mt-1">
                                {format(streaming.valorIntegral)}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function StepConfiguration({
    selectedStreamings,
    configurations,
    onUpdate
}: {
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    onUpdate: (id: number, field: keyof SelectedStreaming, value: any) => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Configure os Valores</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Defina o valor base <strong>mensal</strong> e a frequência de faturamento.
                </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {selectedStreamings.map(streaming => (
                    <StreamingConfigItem
                        key={streaming.id}
                        streaming={streaming}
                        config={configurations.get(streaming.id)}
                        onUpdate={onUpdate}
                    />
                ))}
            </div>
        </div>
    );
}

function StreamingConfigItem({
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
        <div className="border-2 border-gray-200 rounded-2xl p-4">
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

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Frequência
                    </label>
                    <Select
                        value={config.frequencia}
                        onValueChange={(value) => onUpdate(streaming.id, 'frequencia', value as FrequenciaPagamento)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Filter enabled frequencies (Bug I3 - Fixed) */}
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
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between items-center gap-2 flex-wrap">
                        <span className="shrink-0">Valor Mensal ({currencyInfo.symbol})</span>
                        {billing.temLucro && (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                                +{format(billing.lucroMensal)}/mês
                            </span>
                        )}
                    </label>
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

// Custom hook to centralize slot counting (Improvement M1)
function useTotalSlots(quantities: Map<number, number>) {
    return useMemo(() => Array.from(quantities.values()).reduce((acc, qty) => acc + qty, 0), [quantities]);
}

function StepParticipants({
    participantes,
    selectedIds,
    quantities,
    onToggle,
    onQuantityChange,
    onSelectAll,
    searchTerm,
    onSearchChange,
    capacityInfo
}: {
    participantes: ParticipanteOption[];
    selectedIds: Set<number>;
    quantities: Map<number, number>;
    onToggle: (id: number) => void;
    onQuantityChange: (id: number, delta: number) => void;
    onSelectAll: () => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    capacityInfo: { isOverloaded: boolean; minSlots: number; showWarning: boolean };
}) {
    // Local filtering
    const filtered = useMemo(() => {
        if (!searchTerm) return participantes;
        return participantes.filter(p =>
            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.whatsappNumero.includes(searchTerm)
        );
    }, [participantes, searchTerm]);

    return (
        <div className="space-y-3 h-[60vh] md:h-[460px] flex flex-col">
            <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">Selecione os Participantes</h3>
                <p className="text-xs text-gray-500 mt-1">
                    Escolha quem fará parte destas assinaturas
                </p>
            </div>

            <div className="flex flex-col flex-1 lg:p-2 p-1 gap-2 rounded-xl overflow-hidden shadow-sm">
                <div className="  flex flex-col gap-3">
                    {/* Toolbar: Search + Actions */}
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${selectedIds.size > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                {selectedIds.size} sel.
                            </span>
                            <button
                                onClick={onSelectAll}
                                className="text-gray-500 hover:text-primary transition-colors p-1"
                                title={selectedIds.size === filtered.length ? "Desmarcar Todos" : "Marcar Todos"}
                            >
                                <div className={`w-4 h-4 border-2 rounded ${selectedIds.size === filtered.length && filtered.length > 0
                                    ? 'bg-primary border-primary'
                                    : 'border-gray-400'
                                    } flex items-center justify-center`}>
                                    {selectedIds.size === filtered.length && filtered.length > 0 && (
                                        <Check size={10} className="text-white" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Capacity Warning */}
                    {capacityInfo.showWarning && (
                        <div className={`text-sm px-2 py-1.5 rounded-md border flex items-start gap-2 ${capacityInfo.isOverloaded
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>
                            <div className="mt-0.5 shrink-0">
                                {capacityInfo.isOverloaded ? <X size={12} /> : <Users size={12} />}
                            </div>
                            <div className="flex-1 leading-tight">
                                <span className="font-bold mr-1">
                                    {capacityInfo.isOverloaded ? "Excedido!" : "Limite:"}
                                </span>
                                {capacityInfo.isOverloaded
                                    ? `Sobrecarga em alguns streamings.`
                                    : `Max ${capacityInfo.minSlots} vagas no streaming com menos disponibilidade.`}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {filtered.map(p => {
                        const isSelected = selectedIds.has(p.id);
                        const qty = quantities.get(p.id) || 1;

                        return (
                            <div
                                key={p.id}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all cursor-pointer ${isSelected
                                    ? "bg-primary/5 border border-primary/20"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                                onClick={() => onToggle(p.id)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 ${isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                                        }`}>
                                        {p.nome.charAt(0)}
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className={`font-medium truncate text-xs sm:text-sm ${isSelected ? "text-primary" : "text-gray-700"}`}>
                                            {p.nome}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {p.whatsappNumero}
                                        </p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onQuantityChange(p.id, -1)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            disabled={qty <= 1}
                                            title="Diminuir quantidade"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{qty}</span>
                                        <button
                                            onClick={() => onQuantityChange(p.id, 1)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                            title="Aumentar quantidade"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}

                                {isSelected && <Check size={14} className="text-primary shrink-0" />}
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="text-center py-8 flex flex-col items-center gap-1 text-gray-500">
                            <Search size={24} className="opacity-20" />
                            <p className="text-xs">Nada encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StepSummary({
    selectedStreamings,
    selectedParticipants,
    configurations,
    dataInicio,
    onDataInicioChange,
    cobrancaAutomatica,
    onCobrancaChange,
    overloadedStreamings
}: {
    selectedStreamings: StreamingOption[];
    selectedParticipants: (ParticipanteOption & { quantidade?: number })[];
    configurations: Map<number, SelectedStreaming>;
    dataInicio: string;
    onDataInicioChange: (val: string) => void;
    cobrancaAutomatica: boolean;
    onCobrancaChange: (val: boolean) => void;
    overloadedStreamings: StreamingOption[];
}) {
    const { format } = useCurrency();
    const isOverloaded = overloadedStreamings.length > 0;

    // Bug P2 - Fixed safe total calculations
    const totalSlots = useMemo(() => {
        return selectedParticipants.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    }, [selectedParticipants]);

    const totalAssinaturas = configurations.size * totalSlots;

    const totalUnitario = useMemo(() => {
        const total = Array.from(configurations.values()).reduce((sum, c) => {
            const val = parseFloat(c.valor) || 0;
            return sum.plus(new Prisma.Decimal(val));
        }, new Prisma.Decimal(0));
        return arredondarMoeda(total).toNumber();
    }, [configurations]);

    const totalGeral = useMemo(() => {
        const total = new Prisma.Decimal(totalUnitario).mul(totalSlots);
        return arredondarMoeda(total).toNumber();
    }, [totalUnitario, totalSlots]);

    const totalCobrancaGeral = useMemo(() => {
        const total = Array.from(configurations.values()).reduce((sum, c) => {
            const cycleTotal = calcularTotalCiclo(c.valor, c.frequencia as FrequenciaPagamento);
            return sum.plus(cycleTotal.mul(totalSlots));
        }, new Prisma.Decimal(0));
        return arredondarMoeda(total).toNumber();
    }, [configurations, totalSlots]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Resumo e Confirmação</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Revise todos os detalhes antes de finalizar
                </p>
            </div>

            {/* Overloaded Warning */}
            {isOverloaded && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <h4 className="font-bold flex items-center gap-2 mb-1">
                        <X size={18} />
                        Limite de vagas excedido
                    </h4>
                    <p className="text-sm mb-2">
                        Os seguintes streamings não suportam {selectedParticipants.reduce((acc, p) => acc + (p.quantidade || 1), 0)} assinaturas:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {overloadedStreamings.map(s => (
                            <li key={s.id}>
                                <strong>{s.nome}</strong>: {s.limiteParticipantes - s.ocupados} vagas disponíveis
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar size={16} />
                            Data e Pagamento
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Data de Início
                                </label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => onDataInicioChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    A primeira cobrança será gerada para esta data.
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-medium text-gray-700 block">
                                        Cobrança Paga
                                    </label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Já marcar como recebido todas as cobranças recorrentes.
                                    </p>
                                </div>
                                <Switch
                                    checked={cobrancaAutomatica}
                                    onCheckedChange={onCobrancaChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-h-[220px] overflow-y-auto">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 sticky top-0 bg-gray-50 pb-2 z-10">
                            <Users size={16} />
                            Participantes ({selectedParticipants.reduce((acc, p) => acc + (p.quantidade || 1), 0)})
                        </h4>
                        <div className="space-y-1">
                            {selectedParticipants.map(p => (
                                <div key={p.id} className="text-xs text-gray-600 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                                        {p.nome}
                                    </div>
                                    {(p.quantidade || 1) > 1 && (
                                        <span className="font-bold bg-primary/10 text-primary px-1.5 rounded text-[10px]">
                                            {p.quantidade}x
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col h-full bg-white shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-3 flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <Wallet size={16} className="text-primary" />
                            Resumo Financeiro
                        </span>
                    </h4>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[200px]">
                        {selectedStreamings.map(streaming => {
                            const config = configurations.get(streaming.id);
                            if (!config) return null;
                            return (
                                <div key={streaming.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <StreamingLogo
                                            name={streaming.nome}
                                            color={streaming.cor}
                                            size="xs"
                                            rounded="md"
                                        />
                                        <div className="truncate">
                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                {streaming.nome}
                                            </p>
                                            <p className="text-[10px] text-gray-500 capitalize">
                                                {config.frequencia}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm text-gray-700">
                                            {format(parseFloat(config.valor))}<span className="text-[10px] font-normal text-gray-400 ml-0.5">/mês</span>
                                        </p>
                                        {config.frequencia !== 'mensal' && (
                                            <p className="text-[10px] text-primary/70">
                                                Cobrança: {format(calcularTotalCiclo(config.valor, config.frequencia as FrequenciaPagamento).toNumber())}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-4 border-t-2 border-gray-100 space-y-2 bg-gray-50/50 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Custo Mensal p/ Pessoa:</span>
                            <span className="font-bold text-gray-700">
                                {format(totalUnitario)}<span className="font-normal text-gray-400 ml-0.5">/mês</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-2 mb-1">
                            <span className="text-gray-500 font-medium">Receita Mensal Estimada:</span>
                            <span className="font-bold text-primary">
                                {format(totalGeral)}<span className="font-normal text-primary/60 ml-0.5">/mês</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <div className="space-y-0.5">
                                <span className="font-bold text-gray-900 text-sm block">Total Próxima Cobrança:</span>
                                <p className="text-[10px] text-gray-400 font-normal">
                                    {totalAssinaturas} novas assinaturas
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-gray-900">
                                    {format(totalCobrancaGeral)}
                                </p>
                                <p className="text-[9px] text-gray-400 leading-tight">
                                    Soma dos ciclos iniciais
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function CreationSummary({
    isOpen,
    onToggle,
    selectedStreamingIds,
    selectedStreamings,
    configurations,
    totalSlots,
    selectedParticipanteIds,
    participantes,
    quantities
}: {
    isOpen: boolean;
    onToggle: () => void;
    selectedStreamingIds: Set<number>;
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    totalSlots: number;
    selectedParticipanteIds: Set<number>;
    participantes: ParticipanteOption[];
    quantities: Map<number, number>;
}) {
    const { format } = useCurrency();
    if (selectedStreamingIds.size === 0) return null;

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50 transition-all">
            <button
                onClick={onToggle}
                className="w-full px-4 py-2 flex items-center justify-between text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-primary" />
                    <span>Veja o que está sendo criado</span>
                </div>
            </button>

            {isOpen && (
                <div className="px-4 pb-3 pt-1 border-t border-gray-100 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Streamings</p>
                            {selectedStreamings.map(s => {
                                const config = configurations.get(s.id);
                                const val = parseFloat(config?.valor || "0");
                                const mult = INTERVALOS_MESES[config?.frequencia as FrequenciaPagamento] || 1;
                                return (
                                    <div key={s.id} className="flex items-center justify-between text-[11px] border-b border-gray-100/50 pb-1 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="text-gray-700 font-medium truncate max-w-[150px]">{s.nome}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-tight">{config?.frequencia}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-600 block">{format(val)}/mês</span>
                                            {mult > 1 && (
                                                <span className="text-[9px] text-primary/60 block">
                                                    Cobrança: {format(calcularTotalCiclo(val, config?.frequencia as FrequenciaPagamento).toNumber())}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Participantes</p>
                            <div className="flex flex-wrap gap-1">
                                {Array.from(selectedParticipanteIds).slice(0, 5).map(id => (
                                    <span key={id} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] text-gray-600">
                                        {participantes.find(p => p.id === id)?.nome.split(' ')[0]}
                                        {(quantities.get(id) || 1) > 1 && ` (x${quantities.get(id)})`}
                                    </span>
                                ))}
                                {selectedParticipanteIds.size > 5 && (
                                    <span className="text-[10px] text-gray-400 self-center">
                                        + {selectedParticipanteIds.size - 5} outros
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Main Component ---


export function AssinaturaMultiplaModal({
    isOpen,
    onClose,
    onSave,
    participantes,
    streamings,
    loading
}: AssinaturaMultiplaModalProps) {
    const [step, setStep] = useState<ModalStep>(ModalStep.STREAMING);
    const [selectedParticipanteIds, setSelectedParticipanteIds] = useState<Set<number>>(new Set());
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [cobrancaAutomaticaPaga, setCobrancaAutomaticaPaga] = useState(false);
    const [selectedStreamingIds, setSelectedStreamingIds] = useState<Set<number>>(new Set());
    const [configurations, setConfigurations] = useState<Map<number, SelectedStreaming>>(new Map());
    const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
    const [searchTerm, setSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // --- Actions ---

    const handleToggleStreaming = (streamingId: number) => {
        const newSet = new Set(selectedStreamingIds);
        if (newSet.has(streamingId)) {
            newSet.delete(streamingId);
            const newConfigs = new Map(configurations);
            newConfigs.delete(streamingId);
            setConfigurations(newConfigs);
        } else {
            newSet.add(streamingId);
            const streaming = streamings.find(s => s.id === streamingId);
            if (streaming) {
                const newConfigs = new Map(configurations);
                const valorPadrao = calcularCustoBase(streaming.valorIntegral, streaming.limiteParticipantes);
                newConfigs.set(streamingId, {
                    streamingId,
                    frequencia: FrequenciaPagamento.mensal,
                    valor: valorPadrao.toFixed(2)
                });
                setConfigurations(newConfigs);
            }
        }
        setSelectedStreamingIds(newSet);
    };

    const handleToggleParticipante = (id: number) => {
        const newSet = new Set(selectedParticipanteIds);
        const newQuantities = new Map(quantities);

        if (newSet.has(id)) {
            newSet.delete(id);
            newQuantities.delete(id);
        } else {
            newSet.add(id);
            newQuantities.set(id, 1);
        }
        setSelectedParticipanteIds(newSet);
        setQuantities(newQuantities);
    };

    const handleQuantityChange = (id: number, delta: number) => {
        const currentQty = quantities.get(id) || 1;
        const newQty = Math.max(1, currentQty + delta);

        // Calculate total slots used by OTHER participants
        let totalUsed = 0;
        quantities.forEach((qty, pid) => {
            if (pid !== id) totalUsed += qty;
        });

        // Check if new quantity exceeds limit for ANY selected streaming
        // We need to check against the TIGHTEST constraint among selected streamings (Bug P3 - Fixed)
        const minAvailable = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));

        if (totalUsed + newQty <= minAvailable) {
            const newQuantities = new Map(quantities);
            newQuantities.set(id, newQty);
            setQuantities(newQuantities);
        }
    };

    const handleSelectAllParticipantes = () => {
        const filtered = !participanteSearchTerm
            ? participantes
            : participantes.filter(p => p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) || p.whatsappNumero.includes(participanteSearchTerm));

        if (selectedParticipanteIds.size === filtered.length) {
            setSelectedParticipanteIds(new Set());
            setQuantities(new Map());
        } else {
            // Respect capacity limit when selecting all (Bug P5 - Fixed)
            const minAvailable = Math.min(...selectedStreamings.map(s => s.limiteParticipantes - s.ocupados));

            const newSet = new Set(selectedParticipanteIds);
            const newQuantities = new Map(quantities);

            let currentTotal = Array.from(newQuantities.values()).reduce((a, b) => a + b, 0);

            filtered.forEach(p => {
                if (!newSet.has(p.id) && currentTotal < minAvailable) {
                    newSet.add(p.id);
                    newQuantities.set(p.id, 1);
                    currentTotal++;
                }
            });

            setSelectedParticipanteIds(newSet);
            setQuantities(newQuantities);
        }
    };

    const handleUpdateConfig = (streamingId: number, field: keyof SelectedStreaming, value: any) => {
        const newConfigs = new Map(configurations);
        const current = newConfigs.get(streamingId);

        if (current) {
            let updates = { [field]: value };
            // QA Fix: If frequency changes, we DO NOT multiply the monthly value in the field.
            // The monthly value is the base. The total is calculated only for display.
            newConfigs.set(streamingId, { ...current, ...updates });
            setConfigurations(newConfigs);
        }
    };

    const handleClose = () => {
        setStep(ModalStep.STREAMING);
        setSelectedParticipanteIds(new Set());
        setQuantities(new Map());
        setDataInicio(new Date().toISOString().split('T')[0]);
        setCobrancaAutomaticaPaga(false);
        setSelectedStreamingIds(new Set());
        setConfigurations(new Map());
        setSearchTerm("");
        setParticipanteSearchTerm("");
        onClose();
    };

    // --- Computed ---

    const totalSlots = useTotalSlots(quantities);

    const selectedStreamings = useMemo(() => Array.from(selectedStreamingIds)
        .map(id => streamings.find(s => s.id === id))
        .filter(Boolean) as StreamingOption[], [selectedStreamingIds, streamings]);

    // Calculate overloaded streamings (Bug P4 - Fixed dependencies)
    const overloadedStreamings = useMemo(() => {
        return selectedStreamings.filter(s => {
            const available = s.limiteParticipantes - s.ocupados;
            return totalSlots > available;
        });
    }, [selectedStreamings, totalSlots]);

    const isOverloaded = overloadedStreamings.length > 0;

    // Calculate minimum available slots for warning
    const minAvailableSlots = useMemo(() => {
        if (selectedStreamingIds.size === 0) return Infinity;
        const slots = selectedStreamings.map(s => s.limiteParticipantes - s.ocupados);
        return Math.min(...slots);
    }, [selectedStreamings, selectedStreamingIds]);

    const showCapacityWarning = selectedStreamingIds.size > 0;

    // --- Navigation ---

    const canNext = () => {
        switch (step) {
            case ModalStep.STREAMING: return selectedStreamingIds.size > 0;
            case ModalStep.VALUES: return true;
            case ModalStep.PARTICIPANTS: return totalSlots > 0 && !isOverloaded; // Bug P6 - Fixed
            default: return false;
        }
    };

    const handleNext = () => {
        if (canNext()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = () => {
        if (selectedParticipanteIds.size === 0 || configurations.size === 0 || isOverloaded) return;

        const expandedParticipanteIds: number[] = [];
        selectedParticipanteIds.forEach(id => {
            const qty = quantities.get(id) || 1;
            for (let i = 0; i < qty; i++) {
                expandedParticipanteIds.push(id);
            }
        });

        onSave({
            participanteIds: expandedParticipanteIds,
            assinaturas: Array.from(configurations.values()).map(config => ({
                streamingId: config.streamingId,
                frequencia: config.frequencia,
                valor: parseFloat(config.valor)
            })),
            dataInicio,
            cobrancaAutomaticaPaga
        });
    };

    // Footer Render
    const renderFooter = () => (
        <div className="w-full space-y-4">
            <CreationSummary
                isOpen={isSummaryOpen}
                onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
                selectedStreamingIds={selectedStreamingIds}
                selectedStreamings={selectedStreamings}
                configurations={configurations}
                totalSlots={totalSlots}
                selectedParticipanteIds={selectedParticipanteIds}
                participantes={participantes}
                quantities={quantities}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6 sm:gap-0">
                {/* Step Indicators - Always visible, top on mobile, left on desktop */}
                <div className="flex gap-2 mb-2 sm:mb-0">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`h-2 w-12 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                {/* Action Buttons Container */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                    {step > ModalStep.STREAMING && (
                        <button
                            onClick={handleBack}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            <ChevronLeft size={18} />
                            <span>Voltar</span>
                        </button>
                    )}
                    {step < ModalStep.SUMMARY ? (
                        <button
                            onClick={handleNext}
                            disabled={!canNext()}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedParticipanteIds.size === 0 || loading || isOverloaded}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" color="white" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Confirmar Assinaturas
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Criar Assinaturas `}
            className="sm:max-w-4xl"
            footer={renderFooter()}
        >
            {step === ModalStep.STREAMING && (
                <StepStreamings
                    streamings={streamings}
                    selectedIds={selectedStreamingIds}
                    onToggle={handleToggleStreaming}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            )}

            {
                step === ModalStep.VALUES && (
                    <StepConfiguration
                        selectedStreamings={selectedStreamings}
                        configurations={configurations}
                        onUpdate={handleUpdateConfig}
                    />
                )
            }

            {
                step === ModalStep.PARTICIPANTS && (
                    <StepParticipants
                        participantes={participantes}
                        selectedIds={selectedParticipanteIds}
                        quantities={quantities}
                        onToggle={handleToggleParticipante}
                        onQuantityChange={handleQuantityChange}
                        onSelectAll={handleSelectAllParticipantes}
                        searchTerm={participanteSearchTerm}
                        onSearchChange={setParticipanteSearchTerm}
                        capacityInfo={{
                            isOverloaded,
                            minSlots: minAvailableSlots,
                            showWarning: showCapacityWarning
                        }}
                    />
                )
            }

            {
                step === ModalStep.SUMMARY && (
                    <StepSummary
                        selectedStreamings={selectedStreamings}
                        selectedParticipants={Array.from(selectedParticipanteIds).map(id => {
                            const original = participantes.find(p => p.id === id);
                            return original ? { ...original, quantidade: quantities.get(id) || 1 } : null
                        }).filter(Boolean) as any[]}
                        configurations={configurations}
                        dataInicio={dataInicio}
                        onDataInicioChange={setDataInicio}
                        cobrancaAutomatica={cobrancaAutomaticaPaga}
                        onCobrancaChange={setCobrancaAutomaticaPaga}
                        overloadedStreamings={overloadedStreamings}
                    />
                )
            }
        </Modal >
    );
}

