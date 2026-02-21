"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { useModalDetails } from "@/hooks/useModalDetails";
import { ParticipantSection } from "./shared/ParticipantSection";
import { cn } from "@/lib/utils";
import {
    Hash,
    CheckCircle2,
    Globe,
    AlertOctagon,
    Clock,
    Receipt,
    Wallet,
    Copy,
    Image as ImageIcon,
    QrCode
} from "lucide-react";

import { ModalPagamentoCobranca } from "@/components/faturas/ModalPagamentoCobranca";

import { aprovarComprovanteAction, rejeitarComprovanteAction } from "@/actions/comprovantes";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

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
    const { copied, handleCopy, formatDate } = useModalDetails();
    const { success: toastSuccess, error: toastError } = useToast();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleAprovar = async () => {
        setIsProcessing(true);
        const res = await aprovarComprovanteAction(cobranca.id);
        setIsProcessing(false);
        if (res.sucesso) {
            toastSuccess("Comprovante aprovado e fatura dada como paga!");
            onClose();
        } else {
            toastError((res as any).erro || "Erro ao aprovar comprovante.");
        }
    };

    const handleRejeitar = async () => {
        setIsProcessing(true);
        const res = await rejeitarComprovanteAction(cobranca.id);
        setIsProcessing(false);
        if (res.sucesso) {
            toastSuccess("Comprovante rejeitado. O participante poderá enviar um novo.");
            onClose();
        } else {
            toastError((res as any).erro || "Erro ao rejeitar comprovante.");
        }
    };

    if (!cobranca) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Fatura"
            className="sm:max-w-2xl"
        >
            <div className="space-y-6">

                {/* 1. HERO SECTION: Valor e Status - Design Compacto e Eficiente para Mobile */}
                <div className="flex items-center gap-3 sm:gap-4 py-5 border-b border-gray-100 mb-2">
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-2xl border border-blue-100 flex-shrink-0">
                        <Receipt className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Fatura do Cliente</p>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight truncate leading-tight">
                                {cobranca.assinatura.participante.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={cobranca.status} className="scale-75 origin-left" />
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase hidden xs:inline">
                                    {new Date(cobranca.periodoInicio).toLocaleDateString('pt-BR', { month: 'short' })} • {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', { month: 'short' })}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total</p>
                            <div className="flex items-baseline justify-end gap-0.5">
                                <span className="text-xl sm:text-3xl font-black text-gray-900 leading-none">
                                    {format(Number(cobranca.valor))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Participante & Contato */}
                <ParticipantSection
                    participant={cobranca.assinatura.participante}
                    streamingInfo={cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                />

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
                                        onClick={() => handleCopy(cobranca.gatewayTransactionId)}
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

                {/* 4. Taxas e Líquido */}
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

                {/* Secção de Comprovativo anexo */}
                {cobranca.comprovanteUrl && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={16} className="text-gray-500" />
                            <h4 className="text-sm font-bold text-gray-900">Comprovativo Anexado</h4>
                        </div>
                        <div className="w-full flex justify-center bg-white border border-gray-200 rounded-lg p-2 max-h-[400px] overflow-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={cobranca.comprovanteUrl}
                                alt="Comprovativo de Pagamento"
                                className="max-w-full object-contain rounded"
                            />
                        </div>
                        {cobranca.status === 'aguardando_aprovacao' && (
                            <div className="flex gap-3 pt-2">
                                <Button
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                                    onClick={handleAprovar}
                                    disabled={isProcessing}
                                >
                                    Confirmar Recebimento
                                </Button>
                                <Button
                                    className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 font-bold"
                                    onClick={handleRejeitar}
                                    variant="secondary"
                                    disabled={isProcessing}
                                >
                                    Rejeitar
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Footer de Alerta */}
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
                    <Button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full gap-2 font-bold text-primary bg-primary/5 hover:bg-primary/10 border-primary/20"
                        variant="secondary"
                    >
                        <QrCode size={16} />
                        Gerar PIX / Pagamento
                    </Button>
                    <Button onClick={onClose} variant="outline" className="w-full">
                        Fechar
                    </Button>
                </div>
            </div>

            <ModalPagamentoCobranca
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                fatura={cobranca}
            />
        </Modal>
    );
}
