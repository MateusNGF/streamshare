"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/Spinner";
import { FrequenciaPagamento } from "@prisma/client";
import { INTERVALOS_MESES } from "@/lib/financeiro-utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Check, ChevronRight, ChevronLeft, Search, Users, X, Calendar, Wallet } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

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
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-2 overflow-hidden shadow-sm"
                                style={{ backgroundColor: streaming.cor }}
                            >
                                {streaming.iconeUrl ? (
                                    <img
                                        src={streaming.iconeUrl}
                                        alt={streaming.nome}
                                        className="w-8 h-8 object-contain brightness-0 invert"
                                    />
                                ) : (
                                    streaming.nome.charAt(0)
                                )}
                            </div>
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
    const { format, currencyInfo } = useCurrency();
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Configure os Valores</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Defina a frequência e o valor para cada streaming selecionado
                </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {selectedStreamings.map(streaming => {
                    const config = configurations.get(streaming.id);
                    if (!config) return null;

                    return (
                        <div key={streaming.id} className="border-2 border-gray-200 rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden shadow-sm"
                                    style={{ backgroundColor: streaming.cor }}
                                >
                                    {streaming.iconeUrl ? (
                                        <img
                                            src={streaming.iconeUrl}
                                            alt={streaming.nome}
                                            className="w-6 h-6 object-contain brightness-0 invert"
                                        />
                                    ) : (
                                        streaming.nome.charAt(0)
                                    )}
                                </div>
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
                                            <SelectItem value={FrequenciaPagamento.mensal}>Mensal</SelectItem>
                                            <SelectItem value={FrequenciaPagamento.trimestral}>Trimestral</SelectItem>
                                            <SelectItem value={FrequenciaPagamento.semestral}>Semestral</SelectItem>
                                            <SelectItem value={FrequenciaPagamento.anual}>Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Valor ({currencyInfo.symbol})
                                    </label>
                                    <CurrencyInput
                                        value={parseFloat(config.valor)}
                                        onChange={(val) => onUpdate(streaming.id, 'valor', val.toString())}
                                        placeholder={(streaming.valorIntegral / streaming.limiteParticipantes).toFixed(2)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Valor mensal sugerido: {format(streaming.valorIntegral / streaming.limiteParticipantes)}/mês
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StepParticipants({
    participantes,
    selectedIds,
    onToggle,
    onSelectAll,
    searchTerm,
    onSearchChange,
    capacityInfo
}: {
    participantes: ParticipanteOption[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
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

            <div className="flex flex-col flex-1 border rounded-xl overflow-hidden shadow-sm">
                <div className="p-2 bg-gray-50 border-b flex flex-col gap-2">
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
                        <div className={`text-xs px-2 py-1.5 rounded-md border flex items-start gap-2 ${capacityInfo.isOverloaded
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
                                Max {capacityInfo.minSlots} vagas no streaming mais cheio.
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                    {filtered.map(p => {
                        const isSelected = selectedIds.has(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => onToggle(p.id)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${isSelected
                                    ? "bg-primary/5 border border-primary/20"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
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
                                {isSelected && <Check size={14} className="text-primary shrink-0" />}
                            </button>
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
    selectedParticipants: ParticipanteOption[];
    configurations: Map<number, SelectedStreaming>;
    dataInicio: string;
    onDataInicioChange: (val: string) => void;
    cobrancaAutomatica: boolean;
    onCobrancaChange: (val: boolean) => void;
    overloadedStreamings: StreamingOption[];
}) {
    const { format } = useCurrency();
    const isOverloaded = overloadedStreamings.length > 0;
    const totalAssinaturas = configurations.size * selectedParticipants.length;
    const totalUnitario = Array.from(configurations.values()).reduce((sum, c) => sum + parseFloat(c.valor || "0"), 0);
    const totalGeral = totalUnitario * selectedParticipants.length;

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
                        Os seguintes streamings não suportam {selectedParticipants.length} participantes:
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
                            Participantes ({selectedParticipants.length})
                        </h4>
                        <div className="space-y-1">
                            {selectedParticipants.map(p => (
                                <div key={p.id} className="text-xs text-gray-600 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                                    {p.nome}
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
                                        <div
                                            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                                            style={{ backgroundColor: streaming.cor }}
                                        >
                                            {streaming.nome.charAt(0)}
                                        </div>
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
                                            {format(parseFloat(config.valor))}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-4 border-t-2 border-gray-100 space-y-3 bg-gray-50/50 p-3 rounded-xl">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Valor por Pessoa:</span>
                            <span className="font-bold text-gray-700">
                                {format(totalUnitario)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Geral:</span>
                            <div className="text-right">
                                <p className="text-xl font-bold text-primary">
                                    {format(totalGeral)}
                                </p>
                                <p className="text-[10px] text-gray-400 font-normal">
                                    {totalAssinaturas} novas assinaturas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
    const [searchTerm, setSearchTerm] = useState("");
    const [participanteSearchTerm, setParticipanteSearchTerm] = useState("");

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
                const valorPadrao = streaming.valorIntegral / streaming.limiteParticipantes;
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
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedParticipanteIds(newSet);
    };

    const handleSelectAllParticipantes = () => {
        // We need to know current filtered list to toggle correctly
        // But since this is inside the main component, we should probably check against filteredParticipantes
        // Re-calculating filtering here for logic correctness
        const filtered = !participanteSearchTerm
            ? participantes
            : participantes.filter(p => p.nome.toLowerCase().includes(participanteSearchTerm.toLowerCase()) || p.whatsappNumero.includes(participanteSearchTerm));

        if (selectedParticipanteIds.size === filtered.length) {
            setSelectedParticipanteIds(new Set());
        } else {
            const newSet = new Set(selectedParticipanteIds);
            filtered.forEach(p => newSet.add(p.id));
            setSelectedParticipanteIds(newSet);
        }
    };

    const handleUpdateConfig = (streamingId: number, field: keyof SelectedStreaming, value: any) => {
        const newConfigs = new Map(configurations);
        const current = newConfigs.get(streamingId);

        if (current) {
            let updates = { [field]: value };
            if (field === 'frequencia') {
                const streaming = streamings.find(s => s.id === streamingId);
                if (streaming) {
                    const novaFrequencia = value as FrequenciaPagamento;
                    const valorMensal = streaming.valorIntegral / streaming.limiteParticipantes;
                    const novoValor = valorMensal * INTERVALOS_MESES[novaFrequencia];

                    updates = {
                        ...updates,
                        valor: novoValor.toFixed(2)
                    };
                }
            }
            newConfigs.set(streamingId, { ...current, ...updates });
            setConfigurations(newConfigs);
        }
    };

    const handleClose = () => {
        setStep(ModalStep.STREAMING);
        setSelectedParticipanteIds(new Set());
        setDataInicio(new Date().toISOString().split('T')[0]);
        setCobrancaAutomaticaPaga(false);
        setSelectedStreamingIds(new Set());
        setConfigurations(new Map());
        setSearchTerm("");
        setParticipanteSearchTerm("");
        onClose();
    };

    // --- Computed ---

    const selectedStreamings = useMemo(() => Array.from(selectedStreamingIds)
        .map(id => streamings.find(s => s.id === id))
        .filter(Boolean) as StreamingOption[], [selectedStreamingIds, streamings]);

    // Calculate overloaded streamings
    const overloadedStreamings = useMemo(() => {
        return selectedStreamings.filter(s => {
            const available = s.limiteParticipantes - s.ocupados;
            return selectedParticipanteIds.size > available;
        });
    }, [selectedStreamings, selectedParticipanteIds, streamings]);

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
            case ModalStep.PARTICIPANTS: return selectedParticipanteIds.size > 0 && !isOverloaded;
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

        onSave({
            participanteIds: Array.from(selectedParticipanteIds),
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
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-0">
            <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                    <div
                        key={s}
                        className={`h-2 w-12 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                {step > ModalStep.STREAMING && (
                    <button
                        onClick={handleBack}
                        className="flex-1 md:flex-none px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <ChevronLeft size={18} />
                        Voltar
                    </button>
                )}
                {step < ModalStep.SUMMARY ? (
                    <button
                        onClick={handleNext}
                        disabled={!canNext()}
                        className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Próximo
                        <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedParticipanteIds.size === 0 || loading || isOverloaded}
                        className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" color="white" />
                                Criando...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Confirmar ( {configurations.size * selectedParticipanteIds.size} )
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Criar Assinaturas em Massa - Passo ${step}/4`}
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

            {step === ModalStep.VALUES && (
                <StepConfiguration
                    selectedStreamings={selectedStreamings}
                    configurations={configurations}
                    onUpdate={handleUpdateConfig}
                />
            )}

            {step === ModalStep.PARTICIPANTS && (
                <StepParticipants
                    participantes={participantes}
                    selectedIds={selectedParticipanteIds}
                    onToggle={handleToggleParticipante}
                    onSelectAll={handleSelectAllParticipantes}
                    searchTerm={participanteSearchTerm}
                    onSearchChange={setParticipanteSearchTerm}
                    capacityInfo={{
                        isOverloaded,
                        minSlots: minAvailableSlots,
                        showWarning: showCapacityWarning
                    }}
                />
            )}

            {step === ModalStep.SUMMARY && (
                <StepSummary
                    selectedStreamings={selectedStreamings}
                    selectedParticipants={participantes.filter(p => selectedParticipanteIds.has(p.id))}
                    configurations={configurations}
                    dataInicio={dataInicio}
                    onDataInicioChange={setDataInicio}
                    cobrancaAutomatica={cobrancaAutomaticaPaga}
                    onCobrancaChange={setCobrancaAutomaticaPaga}
                    overloadedStreamings={overloadedStreamings}
                />
            )}
        </Modal>
    );
}
