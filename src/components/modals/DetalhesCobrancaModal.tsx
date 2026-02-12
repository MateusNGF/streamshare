"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import {
    Calendar,
    CreditCard,
    Hash,
    Copy,
    CheckCircle2,
    Globe,
    AlertOctagon,
    Clock,
    User
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
    const [copied, setCopied] = useState(false);

    if (!cobranca) return null;

    const formatDate = (date: Date | string | null, includeTime = false) => {
        if (!date) return "-";
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    const handleCopyId = () => {
        if (cobranca.gatewayTransactionId) {
            navigator.clipboard.writeText(cobranca.gatewayTransactionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Fatura"
            className="sm:max-w-2xl"
        >
            <div className="space-y-6">

                {/* 1. HERO SECTION: Valor e Status (Foco na Clareza) */}
                <div className="flex flex-col items-center justify-center py-6 border-b border-gray-50 relative">
                    <StatusBadge status={cobranca.status} className="mb-4 shadow-sm" />

                    <div className="text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Valor Total
                        </span>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight flex items-baseline justify-center gap-1">
                            <span className="text-lg text-gray-400 font-bold">R$</span>
                            {format(Number(cobranca.valor)).replace('R$', '').trim()}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mt-2 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                            Referência: {new Date(cobranca.periodoInicio).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* 2. Participante (Humanização) */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
                        <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</p>
                        <h3 className="font-bold text-gray-900 truncate">{cobranca.assinatura.participante.nome}</h3>
                        <p className="text-xs text-gray-500 truncate">
                            {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                        </p>
                    </div>
                </div>

                {/* 3. Grid de Informações Técnicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Bloco de Datas */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Cronograma</h4>
                        <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock size={14} className="text-blue-500" />
                                    <span className="text-xs font-semibold">Vencimento</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {formatDate(cobranca.dataVencimento)}
                                </span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                    <span className="text-xs font-semibold">Pagamento</span>
                                </div>
                                <span className={cn("text-sm font-bold", cobranca.dataPagamento ? "text-green-700" : "text-gray-300")}>
                                    {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento, true) : "Pendente"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bloco Técnico / Gateway */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Processamento</h4>
                        <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Globe size={14} className="text-purple-500" />
                                    <span className="text-xs font-semibold">Gateway</span>
                                </div>
                                <span className="text-xs font-bold uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                    {cobranca.gatewayProvider || "Manual"}
                                </span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
                                    <Hash size={14} className="text-gray-400" />
                                    <span className="text-xs font-semibold">ID Trans.</span>
                                </div>

                                {cobranca.gatewayTransactionId ? (
                                    <button
                                        onClick={handleCopyId}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition-colors bg-gray-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-gray-100 group max-w-[120px]"
                                        title="Copiar ID"
                                    >
                                        <span className="font-mono truncate">{cobranca.gatewayTransactionId}</span>
                                        {copied ? <CheckCircle2 size={10} className="text-green-500" /> : <Copy size={10} className="opacity-50 group-hover:opacity-100" />}
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-300 italic">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Footer de Alerta (Somente se necessário) */}
                {cobranca.deletedAt && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-black text-red-900">Cobrança Removida</h4>
                            <p className="text-xs text-red-700 mt-1">
                                O registro desta cobrança foi inativado em {formatDate(cobranca.deletedAt, true)}.
                            </p>
                        </div>
                    </div>
                )}

                {/* Ações do Footer */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
                    <Button onClick={onClose} variant="outline" className="w-full">
                        Fechar
                    </Button>
                    {/* Espaço para botões de ação futura (Ex: Reenviar recibo) */}
                </div>
            </div>
        </Modal>
    );
}