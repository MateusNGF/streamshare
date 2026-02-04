"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { createAssinatura } from "@/actions/assinaturas";
import { AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

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

    const [formData, setFormData] = useState({
        participanteId: preSelectedParticipanteId ? preSelectedParticipanteId.toString() : "",
        streamingId: "",
        frequencia: "mensal",
        valor: "",
        dataInicio: new Date().toISOString().split('T')[0],
        cobrancaAutomaticaPaga: false,
    });
    const { currencyInfo } = useCurrency();

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
            });
        }
    }, [isOpen, preSelectedParticipanteId]);

    const loadData = async () => {
        try {
            const [p, s] = await Promise.all([getParticipantes(), getStreamings()]);
            setParticipantes(p);
            setStreamings(s);
        } catch (error) {
            setError("Erro ao carregar dados.");
        }
    };

    const handleStreamingSelect = (streamingId: string) => {
        const streaming = streamings.find(s => s.id.toString() === streamingId);
        if (streaming) {
            // Calculate suggested value per participant
            const suggestedValue = (Number(streaming.valorIntegral) / streaming.limiteParticipantes).toFixed(2);

            setFormData(prev => ({
                ...prev,
                streamingId,
                valor: suggestedValue
            }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createAssinatura({
                participanteId: parseInt(formData.participanteId),
                streamingId: parseInt(formData.streamingId),
                frequencia: formData.frequencia as any,
                valor: parseFloat(formData.valor),
                dataInicio: formData.dataInicio,
                cobrancaAutomaticaPaga: formData.cobrancaAutomaticaPaga,
            });
            onClose();
        } catch (error: any) {
            setError(error.message);
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
                                                {s.catalogo.iconeUrl && (
                                                    <img
                                                        src={s.catalogo.iconeUrl}
                                                        alt={s.catalogo.nome}
                                                        className="w-5 h-5 object-contain"
                                                    />
                                                )}
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
                        </div>
                        <div className="grid gap-2">
                            <Label>Valor ({currencyInfo.symbol})</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Data Início</Label>
                        <Input
                            type="date"
                            value={formData.dataInicio}
                            disabled
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Marca cobranças como Sempre Paga
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Todas as cobranças geradas recorrentes serão debitadas e marcadas como Paga.
                            </p>
                        </div>
                        <Switch
                            checked={formData.cobrancaAutomaticaPaga}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cobrancaAutomaticaPaga: checked }))}
                        />
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
