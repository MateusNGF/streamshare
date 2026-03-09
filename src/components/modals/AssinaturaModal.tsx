"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { createAssinatura } from "@/actions/assinaturas";
import { History, Info, AlertCircle, Calculator, Calendar } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency } from "@/lib/formatCurrency";
import { calcularCustoBase, escolherProximoDiaVencimento, calcularDataVencimentoPadrao, parseLocalDate } from "@/lib/financeiro-utils";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useBillingCalculations } from "@/hooks/useBillingCalculations";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { getAccountDiasVencimento } from "@/actions/settings";
import { gerarCiclosRetroativos } from "@/lib/subscription-backfill";
import { isBefore, startOfDay, isAfter } from "date-fns";
import { Checkbox } from "@/components/ui/Checkbox";
import { Tooltip } from "@/components/ui/Tooltip";

interface AssinaturaModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedParticipanteId?: number;
}


export function AssinaturaModal({ isOpen, onClose, preSelectedParticipanteId }: AssinaturaModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [participantes, setParticipantes] = useState<any[]>([]);
    const [streamings, setStreamings] = useState<any[]>([]);
    const [diasVencimento, setDiasVencimento] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        participanteId: preSelectedParticipanteId ? preSelectedParticipanteId.toString() : "",
        streamingId: "",
        frequencia: "mensal",
        valor: "",
        dataInicio: new Date().toISOString().split('T')[0],
        cobrancaAutomaticaPaga: false,
        primeiroCicloJaPago: false,
        retroactivePaidIndices: [] as number[],
    });
    const { currencyInfo } = useCurrency();

    // SOLID Refactor: Hook to encapsulate financial logic
    const selectedStreaming = useMemo(() =>
        streamings.find(s => s.id.toString() === formData.streamingId),
        [streamings, formData.streamingId]
    );

    const billing = useBillingCalculations({
        valorIntegral: Number(selectedStreaming?.valorIntegral || 0),
        limiteParticipantes: selectedStreaming?.limiteParticipantes || 0,
        valorAtual: formData.valor,
        frequencia: formData.frequencia as any
    });

    useEffect(() => {
        if (isOpen) {
            setError("");
            loadData();
            if (preSelectedParticipanteId) {
                setFormData(prev => ({ ...prev, participanteId: preSelectedParticipanteId.toString() }));
            }
        } else {
            setStep(1);
            setFormData({
                participanteId: "",
                streamingId: "",
                frequencia: "mensal",
                valor: "",
                dataInicio: new Date().toISOString().split('T')[0],
                cobrancaAutomaticaPaga: false,
                primeiroCicloJaPago: false,
                retroactivePaidIndices: [],
            });
        }
    }, [isOpen, preSelectedParticipanteId]);

    const loadData = async () => {
        try {
            const [pResult, sResult, dResult] = await Promise.all([
                getParticipantes(),
                getStreamings(),
                getAccountDiasVencimento()
            ]);
            if (pResult.success && pResult.data) setParticipantes(pResult.data);
            if (sResult.success && sResult.data) setStreamings(sResult.data);
            if (dResult.success && dResult.data) setDiasVencimento(dResult.data);
        } catch (error) {
            setError("Erro ao carregar dados.");
        }
    };

    const ciclosRetroativos = useMemo(() => {
        if (!formData.dataInicio || !formData.valor) return [];
        return gerarCiclosRetroativos({
            dataInicio: parseLocalDate(formData.dataInicio),
            frequencia: formData.frequencia as any,
            valorMensal: parseFloat(formData.valor) || 0,
            diasVencimento
        });
    }, [formData.dataInicio, formData.frequencia, formData.valor, diasVencimento]);

    const isFutureDate = useMemo(() => {
        if (!formData.dataInicio) return false;
        return isAfter(startOfDay(parseLocalDate(formData.dataInicio)), startOfDay(new Date()));
    }, [formData.dataInicio]);

    const handleStreamingSelect = (streamingId: string) => {
        const streaming = streamings.find(s => s.id.toString() === streamingId);
        if (streaming) {
            // Use centralized utility for consistent rounding
            const suggestedValue = calcularCustoBase(Number(streaming.valorIntegral), streaming.limiteParticipantes);

            setFormData(prev => ({
                ...prev,
                streamingId,
                valor: suggestedValue.toFixed(2)
            }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await createAssinatura({
                participanteId: parseInt(formData.participanteId),
                streamingId: parseInt(formData.streamingId),
                frequencia: formData.frequencia as any,
                valor: parseFloat(formData.valor),
                dataInicio: formData.dataInicio,
                cobrancaAutomaticaPaga: formData.cobrancaAutomaticaPaga,
                primeiroCicloJaPago: formData.primeiroCicloJaPago,
                retroactivePaidIndices: formData.retroactivePaidIndices,
            });
            if (result.success) {
                onClose();
            } else if (result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error.message || "Erro ao criar assinatura");
        } finally {
            setLoading(false);
        }
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Assinatura</DialogTitle>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="grid gap-4 py-4">
                    {/* Select Participante */}
                    <div className="grid gap-2">
                        <Label>Participante</Label>
                        <Select
                            value={formData.participanteId}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, participanteId: v }))}
                            disabled={!!preSelectedParticipanteId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um participante" />
                            </SelectTrigger>
                            <SelectContent>
                                {participantes.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Select Streaming */}
                    <div className="grid gap-2">
                        <Label>Streaming</Label>
                        <Select
                            value={formData.streamingId}
                            onValueChange={handleStreamingSelect}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um streaming" />
                            </SelectTrigger>
                            <SelectContent>
                                {streamings.map(s => {
                                    const available = s.limiteParticipantes - (s._count?.assinaturas || 0);
                                    return (
                                        <SelectItem key={s.id} value={s.id.toString()} disabled={available <= 0}>
                                            <div className="flex items-center gap-2">
                                                <StreamingLogo
                                                    name={s.catalogo.nome}
                                                    iconeUrl={s.catalogo.iconeUrl}
                                                    size="xs"
                                                    rounded="md"
                                                />
                                                {s.apelido || s.catalogo.nome}
                                                <span className="text-xs text-muted-foreground">
                                                    ({available} vagas)
                                                </span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Frequência</Label>
                            <Select
                                value={formData.frequencia}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, frequencia: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                            {formData.valor && formData.frequencia !== 'mensal' && (
                                <div className="mt-2 text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2 py-1.5 rounded-lg border border-blue-100/50 flex items-center gap-1.5 ring-1 ring-blue-200/50 w-fit">
                                    <Calculator size={10} className="shrink-0" />
                                    <span>Total Ciclo: {formatCurrency(billing.totalCiclo)}</span>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label className="flex justify-between items-center gap-2 flex-wrap mb-1">
                                <span className="shrink-0">Valor Mensal ({currencyInfo.symbol})</span>
                                {billing.temLucro && (
                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                        Lucro: +{formatCurrency(billing.lucroMensal)}/mês
                                    </span>
                                )}
                            </Label>
                            <CurrencyInput
                                value={formData.valor}
                                onValueChange={(val: any) => setFormData(prev => ({ ...prev, valor: val?.toString() || "" }))}
                                placeholder="0,00"
                            />
                            {selectedStreaming && (
                                <p className="text-[9px] text-gray-400 font-medium mt-1.5 text-right">
                                    Custo base: {formatCurrency(billing.custoBase)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Data Início</Label>
                        <Input
                            type="date"
                            value={formData.dataInicio}
                            onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                        />
                        {!isFutureDate && (
                            <div className="flex items-center gap-2 mt-2 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100 w-fit max-w-full">
                                <Calendar size={12} className="text-primary shrink-0" />
                                <p className="text-[10px] text-muted-foreground font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                    Vencimento: <strong className="text-primary italic">{diasVencimento.length > 0
                                        ? escolherProximoDiaVencimento(diasVencimento, parseLocalDate(formData.dataInicio)).toLocaleDateString('pt-BR')
                                        : calcularDataVencimentoPadrao(parseLocalDate(formData.dataInicio)).toLocaleDateString('pt-BR')}</strong>
                                    &nbsp;{(diasVencimento.length > 0) ? "(proporcional)" : ""}
                                </p>
                            </div>
                        )}
                        {isFutureDate && (
                            <div className="bg-blue-50 text-blue-700 p-2.5 rounded-lg text-[10px] font-bold flex items-start gap-2 border border-blue-100 animate-in fade-in zoom-in-95">
                                <Info size={14} className="shrink-0 mt-0.5" />
                                <span>A primeira cobrança será gerada apenas em <strong>{parseLocalDate(formData.dataInicio).toLocaleDateString('pt-BR')}</strong>. O participante terá acesso liberado até lá? Verifique se faz sentido cobrar antes.</span>
                            </div>
                        )}
                    </div>

                    {/* Retroactive Charges List */}
                    {ciclosRetroativos.length > 0 && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-900">
                                    <History size={14} />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Ciclos Retroativos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const all = ciclosRetroativos.map((_, i) => i);
                                            const current = formData.retroactivePaidIndices;
                                            const next = current.length === all.length ? [] : all;
                                            setFormData(prev => ({ ...prev, retroactivePaidIndices: next }));
                                        }}
                                        className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 underline underline-offset-2"
                                    >
                                        {formData.retroactivePaidIndices.length === ciclosRetroativos.length ? 'Desmarcar' : 'Marcar Tudo'}
                                    </button>
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {ciclosRetroativos.length} fatura(s)
                                    </span>
                                </div>
                            </div>

                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                Como a data de início é anterior a hoje, faturas retroativas serão geradas.
                                Marque as que o participante já pagou por fora.
                            </p>

                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                {ciclosRetroativos.map((ciclo, idx) => {
                                    const isPaid = formData.retroactivePaidIndices.includes(idx);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                const next = [...formData.retroactivePaidIndices];
                                                if (!isPaid) next.push(idx);
                                                else next.splice(next.indexOf(idx), 1);
                                                setFormData(prev => ({ ...prev, retroactivePaidIndices: next }));
                                            }}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${isPaid ? 'bg-green-50/50 border-green-200' : 'bg-white border-amber-100/50 hover:border-amber-200'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`text-[10px] font-bold ${isPaid ? 'text-green-700' : 'text-gray-700'}`}>{ciclo.label}</span>
                                                <span className="text-[9px] font-black text-gray-400 opacity-60">Vencimento: {ciclo.dataVencimento.toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black ${isPaid ? 'text-green-700' : 'text-gray-900'}`}>{formatCurrency(Number(ciclo.valor))}</span>
                                                <Checkbox
                                                    checked={isPaid}
                                                    onCheckedChange={() => { }} // Controlled by row click
                                                    className={isPaid ? 'border-green-600 bg-green-600 text-white' : ''}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3">
                        <div className={`flex items-center justify-between space-x-2 rounded-2xl border-2 p-3.5 transition-all ${formData.primeiroCicloJaPago ? 'bg-green-50/30 border-green-100 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label className={`text-[11px] font-black uppercase tracking-tight ${formData.primeiroCicloJaPago ? 'text-green-700' : 'text-gray-900'}`}>Migração — Ciclo Pago</Label>
                                    <Tooltip content="Marque se o participante já pagou o ciclo vigente. A primeira fatura será gerada como Paga.">
                                        <Info size={12} className="text-gray-400 cursor-help" />
                                    </Tooltip>
                                </div>
                                <p className="text-[9px] text-muted-foreground font-bold leading-tight max-w-[200px]">
                                    A cobrança atual não ficará pendente.
                                </p>
                            </div>
                            <Switch
                                checked={formData.primeiroCicloJaPago}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, primeiroCicloJaPago: checked }))}
                                disabled={ciclosRetroativos.length > 0}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>

                        <div className={`flex items-center justify-between space-x-2 rounded-2xl border-2 p-3.5 transition-all ${formData.cobrancaAutomaticaPaga ? 'bg-primary/5 border-primary/10 shadow-sm' : 'border-gray-100'}`}>
                            <div className="space-y-1">
                                <Label className={`text-[11px] font-black uppercase tracking-tight ${formData.cobrancaAutomaticaPaga ? 'text-primary' : 'text-gray-500'}`}>Fluxo Futuro — Sempre Pago</Label>
                                <p className="text-[9px] text-muted-foreground font-bold leading-tight max-w-[200px]">
                                    Renovações futuras automáticas.
                                </p>
                            </div>
                            <Switch
                                checked={formData.cobrancaAutomaticaPaga}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cobrancaAutomaticaPaga: checked }))}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.participanteId || !formData.streamingId}>
                        {loading ? "Criando..." : "Criar Assinatura"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
