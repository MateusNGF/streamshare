"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { useModalDetails } from "@/hooks/useModalDetails";
import { ParticipantSection } from "./shared/ParticipantSection";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import {
    Hash,
    CheckCircle2,
    Globe,
    AlertOctagon,
    Clock,
    Receipt,
    Wallet,
    Copy,
    QrCode
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
    const { copied, handleCopy, formatDate } = useModalDetails();
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

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

                {/* F3: Bloco de PIX para o Gestor (se disponível e pendente) */}
                {cobranca.status !== 'pago' && cobranca.pixCopiaECola && (
                    <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <QrCode size={16} className="text-primary" />
                                <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest pl-1">QR Code PIX para envio</h4>
                            </div>
                            <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase">Aguardando Pagamento</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            {cobranca.pixQrCode && (
                                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                                    <img
                                        src={`data:image/png;base64,${cobranca.pixQrCode}`}
                                        alt="QR Code"
                                        className="w-32 h-32"
                                    />
                                </div>
                            )}

                            <div className="flex-1 w-full space-y-3">
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    Encaminhe o QR Code ou o código abaixo para o participante pelo WhatsApp para agilizar o recebimento.
                                </p>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <input
                                            readOnly
                                            value={cobranca.pixCopiaECola}
                                            className="w-full h-10 bg-white border-gray-100 pl-3 pr-3 rounded-lg text-[10px] font-mono text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all truncate"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            handleCopy(cobranca.pixCopiaECola!);
                                            toastSuccess("Código PIX copiado!");
                                        }}
                                        variant="outline"
                                        className="h-10 px-3 shrink-0 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                                    >
                                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                    {cobranca.status === 'pago' && cobranca.gatewayId && (
                        <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                            onClick={async () => {
                                if (confirm("Deseja realmente estornar este pagamento? O valor será devolvido ao cliente e a cobrança será marcada como estornada.")) {
                                    const { refundPaymentAction } = await import("@/actions/payments");
                                    toastInfo("Processando estorno...");
                                    const res = await refundPaymentAction(cobranca.gatewayId);
                                    if (res.success) {
                                        toastSuccess(res.message as string);
                                        onClose();
                                    } else {
                                        toastError((res.error as string) || "Erro ao estornar pagamento");
                                    }
                                }
                            }}
                        >
                            <AlertOctagon size={16} className="mr-2" />
                            Estornar Pagamento
                        </Button>
                    )}
                    <Button onClick={onClose} variant="outline" className="w-full">
                        Fechar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
