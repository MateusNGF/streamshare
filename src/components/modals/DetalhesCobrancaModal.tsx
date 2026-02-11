"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import {
    Calendar,
    CreditCard,
    Hash,
    RefreshCw,
    Globe,
    FileText,
    History,
    AlertCircle
} from "lucide-react";

interface DetalhesCobrancaModalProps {
    isOpen: boolean;
    onClose: () => void;
    cobranca: any | null;
}

export function DetalhesCobrancaModal({
    isOpen,
    onClose,
    cobranca
}: DetalhesCobrancaModalProps) {
    const { format } = useCurrency();

    if (!cobranca) return null;

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
            title="Detalhes da Cobrança"
            className="sm:max-w-lg"
            footer={
                <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                    Fechar
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Status & Valor Hero */}
                <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                    <StatusBadge status={cobranca.status} className="mb-2" />
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {format(Number(cobranca.valor))}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                        {cobranca.assinatura.participante.nome}
                    </p>
                </div>

                {/* Primary Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={12} /> Vencimento
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                            {cobranca.dataVencimento ? new Date(cobranca.dataVencimento).toLocaleDateString() : '-'}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                            <History size={12} /> Pagamento
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatDate(cobranca.dataPagamento)}
                        </p>
                    </div>
                </div>

                {/* Technical / Gateway Section */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} /> Integração & Gateway
                    </h4>

                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                        <div className="p-3 flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2">
                                <CreditCard size={14} className="text-gray-400" /> Provedor
                            </span>
                            <span className="font-bold text-gray-900 capitalize italic">
                                {cobranca.gatewayProvider || "Manual"}
                            </span>
                        </div>
                        <div className="p-3 flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2">
                                <Hash size={14} className="text-gray-400" /> ID Transação
                            </span>
                            <span className="font-mono text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                                {cobranca.gatewayTransactionId || "N/A"}
                            </span>
                        </div>
                        <div className="p-3 flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2">
                                <RefreshCw size={14} className="text-gray-400" /> Tentativas
                            </span>
                            <span className="font-bold text-gray-900">
                                {cobranca.tentativas || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metadata JSON if exists */}
                {cobranca.metadataJson && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} /> Metadados
                        </h4>
                        <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto max-h-40">
                            <pre className="text-[10px] text-blue-300 font-mono">
                                {JSON.stringify(cobranca.metadataJson, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Soft Delete Warning */}
                {cobranca.deletedAt && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-900">Cobrança Excluída</p>
                            <p className="text-[11px] text-red-700">Esta cobrança foi removida logicamente em {formatDate(cobranca.deletedAt)}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
