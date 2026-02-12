"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { useModalDetails } from "@/hooks/useModalDetails";
import { ParticipantSection } from "./shared/ParticipantSection";
import { ChargesHistoryTable } from "./shared/ChargesHistoryTable";
import { cn } from "@/lib/utils";
import {
    CreditCard,
    AlertTriangle
} from "lucide-react";
import { SubscriptionWithCharges } from "@/types/subscription.types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { calcularTotalCiclo } from "@/lib/financeiro-utils";

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
    const { formatDate } = useModalDetails();

    if (!assinatura) return null;

    // Cálculo de valor do ciclo
    const valorCiclo = calcularTotalCiclo(assinatura.valor, assinatura.frequencia);
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
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor do Ciclo</p>
                        <p className="text-2xl font-black text-gray-900">{format(Number(valorCiclo))}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight -mt-1">{format(Number(assinatura.valor))} / mês</p>
                    </div>
                </div>

                {/* 2. Grid de Informações Contextuais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Bloco A: Participante & Contato */}
                    <ParticipantSection
                        participant={assinatura.participante}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-xl"
                    />

                    {/* Bloco B: Dados Financeiros do Ciclo */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <CreditCard size={12} /> Plano Financeiro
                        </h4>
                        <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-3 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Periodicidade</p>
                                    <p className="text-sm font-bold text-gray-900 capitalize">{assinatura.frequencia}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Custo Mensal</p>
                                    <p className="text-sm font-black text-gray-900">{format(Number(assinatura.valor))} / mês</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-xl border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase">Valor do Próximo Ciclo</p>
                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Recorrência total do plano</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-gray-900 leading-tight">{format(Number(valorCiclo))}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{format(Number(assinatura.valor))} / mês</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Área de Status Crítico (Se Cancelado ou Cancelamento Agendado) */}
                {isCancelled && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Assinatura Cancelada</h4>
                            <p className="text-xs text-red-800 mt-1 italic">
                                "{assinatura.motivoCancelamento || "Motivo não informado"}"
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                                    Encerrado em {formatDate(assinatura.dataCancelamento, true)}
                                </p>
                                {assinatura.canceladoPor && (
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                        Por: {assinatura.canceladoPor.name || assinatura.canceladoPor.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!isCancelled && assinatura.dataCancelamento && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-purple-900 uppercase tracking-tight">Cancelamento Agendado</h4>
                                <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                                    Ainda Ativa
                                </span>
                            </div>
                            <p className="text-xs text-purple-800 mt-1 italic">
                                "{assinatura.motivoCancelamento || "Cancelamento solicitado pelo cliente"}"
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-purple-100/50">
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Data de Término</p>
                                    <p className="text-sm font-black text-purple-700">{formatDate(assinatura.dataCancelamento)}</p>
                                </div>
                                {assinatura.canceladoPor && (
                                    <div>
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Solicitado via Painel por</p>
                                        <p className="text-sm font-black text-purple-700 truncate">{assinatura.canceladoPor.name || assinatura.canceladoPor.email}</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] font-medium text-purple-500 mt-3 leading-relaxed">
                                <span className="font-bold">Nota:</span> O acesso do cliente e as cobranças recorrentes permanecerão ativos até a data de término informada acima.
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. Histórico de Cobranças */}
                <ChargesHistoryTable charges={assinatura.cobrancas} />

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
