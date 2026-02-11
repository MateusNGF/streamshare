"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { Calendar, User, Info, AlertTriangle, Clock } from "lucide-react";
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

    const formatDate = (date: Date | string | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Assinatura"
            className="sm:max-w-4xl"
            footer={
                <Button onClick={onClose} variant="outline">
                    Fechar
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <StreamingLogo
                            name={assinatura.streaming.catalogo.nome}
                            color={assinatura.streaming.catalogo.corPrimaria || '#6d28d9'}
                            iconeUrl={assinatura.streaming.catalogo.iconeUrl}
                            size="lg"
                        />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {assinatura.streaming.apelido || assinatura.streaming.catalogo.nome}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {assinatura.participante.nome}
                            </p>
                        </div>
                    </div>
                    <StatusBadge
                        status={assinatura.status}
                        dataCancelamento={assinatura.dataCancelamento}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Info size={14} /> Dados Gerais
                        </h4>

                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Valor Mensal</span>
                                <span className="font-bold text-gray-900">{format(Number(assinatura.valor))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Frequência</span>
                                <span className="font-medium text-gray-900 capitalize">{assinatura.frequencia}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Criada em</span>
                                <span className="font-medium text-gray-900">{formatDate(assinatura.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Info */}
                    {(assinatura.status === 'cancelada' || assinatura.dataCancelamento) && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle size={14} /> Detalhes do Cancelamento
                            </h4>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 font-medium">
                                <div className="text-sm">
                                    <span className="text-red-600 block mb-1">Motivo:</span>
                                    <p className="text-red-900 bg-white/50 p-2 rounded border border-red-100 text-xs italic">
                                        "{assinatura.motivoCancelamento || "Não informado"}"
                                    </p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Cancelado em:</span>
                                    <span className="text-red-900">{formatDate(assinatura.dataCancelamento)}</span>
                                </div>
                                {assinatura.canceladoPor && (
                                    <div className="flex justify-between text-sm border-t border-red-100 pt-2 mt-2">
                                        <span className="text-red-600">Por:</span>
                                        <span className="text-red-900 flex items-center gap-1">
                                            <User size={12} /> {assinatura.canceladoPor.name || assinatura.canceladoPor.email}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Charges List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} /> Últimas Cobranças
                    </h4>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Período</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Vencimento</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Valor</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assinatura.cobrancas?.slice(0, 5).map((cob) => (
                                    <tr key={cob.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 tabular-nums">
                                            {new Date(cob.periodoInicio).toLocaleDateString()} - {new Date(cob.periodoFim).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                                            {cob.dataVencimento ? new Date(cob.dataVencimento).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-900">
                                            {format(Number(cob.valor))}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <StatusBadge status={cob.status} />
                                        </td>
                                    </tr>
                                ))}
                                {assinatura.cobrancas.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                                            Nenhuma cobrança registrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
