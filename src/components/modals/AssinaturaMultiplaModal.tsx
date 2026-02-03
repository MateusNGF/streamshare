"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { FrequenciaPagamento } from "@prisma/client";
import { FREQUENCIA_MULTIPLICADORES, INTERVALOS_MESES, formatarMoeda, calcularProximoVencimento } from "@/lib/financeiro-utils";
import { Check, ChevronRight, ChevronLeft, Search } from "lucide-react";

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
    valor: string; // Valor que o participante vai pagar (padrão: valorIntegral / limiteParticipantes)
}

interface AssinaturaMultiplaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        participanteId: number;
        assinaturas: Array<{
            streamingId: number;
            frequencia: FrequenciaPagamento;
            valor: number;
        }>;
        dataInicio: string;
    }) => void;
    participantes: ParticipanteOption[];
    streamings: StreamingOption[];
    loading: boolean;
}

export function AssinaturaMultiplaModal({
    isOpen,
    onClose,
    onSave,
    participantes,
    streamings,
    loading
}: AssinaturaMultiplaModalProps) {
    const [step, setStep] = useState(1);
    const [participanteId, setParticipanteId] = useState("");
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStreamingIds, setSelectedStreamingIds] = useState<Set<number>>(new Set());
    const [configurations, setConfigurations] = useState<Map<number, SelectedStreaming>>(new Map());
    const [searchTerm, setSearchTerm] = useState("");

    // Filter streamings
    const filteredStreamings = useMemo(() => {
        if (!searchTerm) return streamings;
        return streamings.filter(s =>
            s.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [streamings, searchTerm]);

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
                // Calcula valor padrão: valor integral dividido por participantes
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

    const handleUpdateConfig = (streamingId: number, field: keyof SelectedStreaming, value: any) => {
        const newConfigs = new Map(configurations);
        const current = newConfigs.get(streamingId);

        if (current) {
            let updates = { [field]: value };

            // Se alterou a frequência, recalcula o valor sugerido
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

    const handleNext = () => {
        if (step === 1 && selectedStreamingIds.size > 0) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = () => {
        if (!participanteId || configurations.size === 0) return;

        onSave({
            participanteId: parseInt(participanteId),
            assinaturas: Array.from(configurations.values()).map(config => ({
                streamingId: config.streamingId,
                frequencia: config.frequencia,
                valor: parseFloat(config.valor)
            })),
            dataInicio
        });
    };

    const handleClose = () => {
        setStep(1);
        setParticipanteId("");
        setDataInicio(new Date().toISOString().split('T')[0]);
        setSelectedStreamingIds(new Set());
        setConfigurations(new Map());
        setSearchTerm("");
        onClose();
    };

    const selectedStreamings = Array.from(selectedStreamingIds)
        .map(id => streamings.find(s => s.id === id))
        .filter(Boolean) as StreamingOption[];

    const totalGeral = Array.from(configurations.values())
        .reduce((sum, config) => sum + parseFloat(config.valor || "0"), 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Criar Múltiplas Assinaturas - Passo ${step}/3`}
            footer={
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-0">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-2 w-12 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                                disabled={loading}
                            >
                                <ChevronLeft size={18} />
                                Voltar
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && selectedStreamingIds.size === 0}
                                className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Próximo
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!participanteId || loading}
                                className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" color="white" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Criar {configurations.size} Assinatura{configurations.size > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            {/* STEP 1: Catalog Selection */}
            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Selecione os Streamings</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Escolha os serviços de streaming que deseja adicionar
                            {selectedStreamingIds.size > 0 && (
                                <span className="ml-2 text-primary font-bold">
                                    ({selectedStreamingIds.size} selecionado{selectedStreamingIds.size > 1 ? 's' : ''})
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Search */}
                    {streamings.length > 4 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar streaming..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {filteredStreamings.map(streaming => {
                            const isSelected = selectedStreamingIds.has(streaming.id);
                            const isFull = streaming.ocupados >= streaming.limiteParticipantes;

                            return (
                                <button
                                    key={streaming.id}
                                    onClick={() => !isFull && handleToggleStreaming(streaming.id)}
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
                                        {formatarMoeda(streaming.valorIntegral)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* STEP 2: Configuration */}
            {step === 2 && (
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
                                            <select
                                                value={config.frequencia}
                                                onChange={(e) => handleUpdateConfig(streaming.id, 'frequencia', e.target.value as FrequenciaPagamento)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            >
                                                <option value={FrequenciaPagamento.mensal}>Mensal</option>
                                                <option value={FrequenciaPagamento.trimestral}>Trimestral</option>
                                                <option value={FrequenciaPagamento.semestral}>Semestral</option>
                                                <option value={FrequenciaPagamento.anual}>Anual</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Valor (R$)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={config.valor}
                                                onChange={(e) => handleUpdateConfig(streaming.id, 'valor', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder={(streaming.valorIntegral / streaming.limiteParticipantes).toFixed(2)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Valor mensal sugerido: {formatarMoeda(streaming.valorIntegral / streaming.limiteParticipantes)}/mês
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* STEP 3: Summary */}
            {step === 3 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirme os Dados</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Revise as informações antes de criar as assinaturas
                        </p>
                    </div>

                    {/* Participant & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Participante *
                            </label>
                            <select
                                value={participanteId}
                                onChange={(e) => setParticipanteId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                disabled={loading}
                            >
                                <option value="">Selecione...</option>
                                {participantes.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Início *
                            </label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Summary List */}
                    <div className="border-2 border-gray-200 rounded-2xl p-4">
                        <h4 className="font-bold text-gray-900 mb-3">Assinaturas a Criar:</h4>
                        <div className="space-y-2">
                            {selectedStreamings.map(streaming => {
                                const config = configurations.get(streaming.id);
                                if (!config) return null;

                                return (
                                    <div key={streaming.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-sm"
                                                style={{ backgroundColor: streaming.cor }}
                                            >
                                                {streaming.iconeUrl ? (
                                                    <img
                                                        src={streaming.iconeUrl}
                                                        alt={streaming.nome}
                                                        className="w-5 h-5 object-contain brightness-0 invert"
                                                    />
                                                ) : (
                                                    streaming.nome.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{streaming.nome}</p>
                                                <p className="text-xs text-gray-500 capitalize">{config.frequencia}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                R$ {parseFloat(config.valor).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground opacity-70">
                                                Vence em: {(() => {
                                                    const [ano, mes, dia] = dataInicio.split('-').map(Number);
                                                    const dataBase = new Date(ano, mes - 1, dia);
                                                    return calcularProximoVencimento(dataBase, config.frequencia).toLocaleDateString('pt-BR');
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
                            {(() => {
                                // Normalizar todos os valores para mensal
                                const totalMensal = Array.from(configurations.values())
                                    .reduce((sum, config) => {
                                        const valor = parseFloat(config.valor || "0");
                                        const multiplicador = FREQUENCIA_MULTIPLICADORES[config.frequencia];
                                        return sum + (valor * multiplicador);
                                    }, 0);

                                // Verificar se todas têm a mesma frequência
                                const frequencias = Array.from(configurations.values()).map(c => c.frequencia);
                                const frequenciaUnica = frequencias.every(f => f === frequencias[0]);

                                if (frequenciaUnica) {
                                    // Se todas têm a mesma frequência, mostra o total direto
                                    const totalDireto = Array.from(configurations.values())
                                        .reduce((sum, config) => sum + parseFloat(config.valor || "0"), 0);

                                    return (
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900 capitalize">Total {frequencias[0]}:</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {formatarMoeda(totalDireto)}
                                            </p>
                                        </div>
                                    );
                                } else {
                                    // Se têm frequências mistas, mostra equivalente mensal
                                    return (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-900">Equivalente Mensal:</p>
                                                <p className="text-2xl font-bold text-primary">
                                                    {formatarMoeda(totalMensal)}
                                                    <span className="text-xs font-normal text-gray-500 ml-1">/mês</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 text-right">
                                                * Valores normalizados para base mensal para comparação
                                            </p>
                                        </>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
