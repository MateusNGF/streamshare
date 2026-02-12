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
    User,
    Mail,
    MessageCircle,
    Receipt,
    Wallet
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
                <div className="flex flex-col items-center justify-center py-8 border-b border-gray-50 relative">
                    <StatusBadge status={cobranca.status} className="mb-4 shadow-sm" />

                    <div className="text-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">
                            Valor do Ciclo
                        </span>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight flex items-baseline justify-center gap-1">
                            <span className="text-lg text-gray-400 font-bold">R$</span>
                            {format(Number(cobranca.valor)).replace('R$', '').trim()}
                        </h2>
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <p className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                Referência: {new Date(cobranca.periodoInicio).toLocaleString('pt-BR', { month: 'long' })}
                                {new Date(cobranca.periodoInicio).getFullYear() !== new Date().getFullYear() && ` ${new Date(cobranca.periodoInicio).getFullYear()}`}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                ({format(Number(cobranca.assinatura.valor))} / mês)
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Participante & Contato (Humanização) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-primary">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Cliente</p>
                            <h3 className="font-bold text-gray-900 truncate">{cobranca.assinatura.participante.nome}</h3>
                            <p className="text-xs text-gray-500 truncate font-medium">
                                {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                            </p>
                        </div>
                        <a
                            href={cobranca.assinatura.participante.whatsappNumero ? `https://wa.me/55${cobranca.assinatura.participante.whatsappNumero.replace(/\D/g, '')}` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all shadow-sm",
                                cobranca.assinatura.participante.whatsappNumero
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                            title="Conversar no WhatsApp"
                        >
                            <MessageCircle size={20} />
                        </a>
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
                                    <span className="text-xs font-bold">Vencimento</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">
                                    {formatDate(cobranca.dataVencimento)}
                                </span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                    <span className="text-xs font-bold">Pagamento</span>
                                </div>
                                <span className={cn("text-sm font-black", cobranca.dataPagamento ? "text-green-600" : "text-gray-300 italic")}>
                                    {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento, true).split(',')[0] : "Pendente"}
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
                                    <span className="text-xs font-bold">Gateway</span>
                                </div>
                                <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                                    {cobranca.gatewayProvider || "Manual"}
                                </span>
                            </div>
                            <div className="w-full h-px bg-gray-50" />
                            <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
                                    <Hash size={14} className="text-gray-400" />
                                    <span className="text-xs font-bold">ID Trans.</span>
                                </div>

                                {cobranca.gatewayTransactionId ? (
                                    <button
                                        onClick={handleCopyId}
                                        className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-primary transition-colors bg-gray-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-gray-100 group max-w-[120px]"
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

                {/* 4. Taxas e Líquido (Se disponível em metadata) */}
                {cobranca.metadataJson && (cobranca.metadataJson.fee || cobranca.metadataJson.net) && (
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-red-500 shadow-sm">
                                <Receipt size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Taxa Gateway</p>
                                <p className="text-sm font-bold text-gray-900">{format(Number(cobranca.metadataJson.fee || 0))}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-green-600 shadow-sm">
                                <Wallet size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Recebimento Líquido</p>
                                <p className="text-sm font-bold text-green-600">{format(Number(cobranca.metadataJson.net || cobranca.valor))}</p>
                            </div>
                        </div>
                    </div>
                )}

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