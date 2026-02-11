"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import {
    Calendar,
    User,
    CreditCard,
    AlertTriangle,
    Clock,
    History,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { SubscriptionWithCharges } from "@/types/subscription.types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface DetalhesAssinaturaModalProps {
    isOpen: boolean;
    onClose: () => void;
    assinatura: SubscriptionWithCharges | null;
}

export function DetalhesAssinaturaModal({
    isOpen,
    onClose,
    assinatura
}: DetalhesAssinaturaModalProps) {
    const { format } = useCurrency();

    if (!assinatura) return null;

    const formatDate = (date: Date | string | null, includeTime = false) => {
        if (!date) return "-";
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    // Cálculo de valor do ciclo
    const multiplier = assinatura.frequencia === 'trimestral' ? 3
        : assinatura.frequencia === 'semestral' ? 6
            : assinatura.frequencia === 'anual' ? 12 : 1;

    const cycleTotal = Number(assinatura.valor) * multiplier;
    const isCancelled = assinatura.status === 'cancelada';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Assinatura"
            className="sm:max-w-3xl"
        >
            <div className="space-y-8">

                {/* 1. Header de Identidade (Hero) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-gray-100">
                    <StreamingLogo
                        name={assinatura.streaming.catalogo.nome}
                        color={assinatura.streaming?.catalogo?.corPrimaria ?? ""}
                        iconeUrl={assinatura.streaming.catalogo.iconeUrl}
                        size="lg"
                        rounded="2xl"
                        className="shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                {assinatura.participante.nome}
                            </h3>
                            <StatusBadge
                                status={assinatura.status}
                                dataCancelamento={assinatura.dataCancelamento}
                                className="scale-90"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <span className="text-primary font-bold">
                                {assinatura.streaming.apelido || assinatura.streaming.catalogo.nome}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span>Início em {formatDate(assinatura.createdAt)}</span>
                        </div>
                    </div>
                    {/* Valor em Destaque no Header (Desktop) */}
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mensalidade</p>
                        <p className="text-2xl font-black text-gray-900">{format(Number(assinatura.valor))}</p>
                    </div>
                </div>

                {/* 2. Grid de Informações Contextuais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Bloco A: Participante & Contato */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <User size={12} /> Dados do Cliente
                        </h4>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">WhatsApp</p>
                                <p className="text-sm font-bold text-gray-900 font-mono">
                                    {assinatura.participante.whatsappNumero || "Não cadastrado"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bloco B: Dados Financeiros do Ciclo */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <CreditCard size={12} /> Plano Financeiro
                        </h4>
                        <div className="bg-white border border-gray-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Ciclo {assinatura.frequencia}</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                    Renova a cada {multiplier} mês(es)
                                </p>
                            </div>
                            {multiplier > 1 && (
                                <div className="text-right border-l border-gray-100 pl-4">
                                    <p className="text-[10px] font-bold text-primary uppercase">Total Ciclo</p>
                                    <p className="text-base font-black text-gray-900">{format(cycleTotal)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Área de Status Crítico (Se Cancelado) */}
                {isCancelled && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Assinatura Cancelada</h4>
                            <p className="text-xs text-red-800 mt-1 italic">
                                "{assinatura.motivoCancelamento || "Motivo não informado"}"
                            </p>
                            <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">
                                Encerrado em {formatDate(assinatura.dataCancelamento, true)}
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. Histórico de Cobranças (Tabela Limpa) */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <History size={12} /> Histórico Recente
                        </h4>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider">Período</th>
                                        <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                                        <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                                        <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {assinatura.cobrancas?.slice(0, 5).map((cob) => {
                                        const isPaid = cob.status === 'pago';
                                        const isOverdue = cob.status === 'atrasado'; // ou logica de data

                                        return (
                                            <tr key={cob.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-4 py-3 font-medium text-gray-600">
                                                    {new Date(cob.periodoInicio).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
                                                    - {new Date(cob.periodoFim).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase()}
                                                </td>
                                                <td className={cn("px-4 py-3 font-bold", isOverdue && !isPaid ? "text-red-500" : "text-gray-700")}>
                                                    {new Date(cob.periodoFim).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-900 text-right">
                                                    {format(Number(cob.valor))}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex justify-center">
                                                        {isPaid ? (
                                                            <CheckCircle2 size={16} className="text-green-500" />
                                                        ) : isOverdue ? (
                                                            <AlertTriangle size={16} className="text-red-500" />
                                                        ) : (
                                                            <Clock size={16} className="text-yellow-500" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!assinatura.cobrancas || assinatura.cobrancas.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                                                Nenhum registro encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer de Ação (Close) */}
                <div className="flex justify-end pt-2 border-t border-gray-50">
                    <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                        Fechar Detalhes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}