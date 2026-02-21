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
    QrCode,
    Loader2,
    MessageCircle
} from "lucide-react";

import QRCode from "react-qr-code";
import { generateStaticPix } from "@/lib/pix-generator";
import { generateWhatsAppLink, generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";

import { ModalPagamentoCobranca } from "@/components/faturas/ModalPagamentoCobranca";

import { aprovarComprovanteAction, rejeitarComprovanteAction } from "@/actions/comprovantes";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";

interface DetalhesCobrancaModalProps {
    isOpen: boolean;
    onClose: () => void;
    cobranca: any | null;
    isAdmin?: boolean;
}

export function DetalhesCobrancaModal({
    isOpen,
    onClose,
    cobranca,
    isAdmin = false
}: DetalhesCobrancaModalProps) {
    const { format } = useCurrency();
    const { copied, handleCopy, formatDate } = useModalDetails();
    const { success: toastSuccess, error: toastError } = useToast();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);

    useEffect(() => {
        if (isOpen && cobranca && cobranca.status !== 'pago' && cobranca.assinatura?.participante?.conta?.chavePix) {
            const loadPix = async () => {
                setIsLoadingPix(true);
                try {
                    const payload = await generateStaticPix(
                        cobranca.assinatura.participante.conta.chavePix,
                        cobranca.assinatura.participante.nome,
                        "Brasil",
                        Number(cobranca.valor),
                        `SS-${cobranca.id}`
                    );
                    setPixPayload(payload);
                } catch (err) {
                    console.error("Erro ao gerar PIX:", err);
                } finally {
                    setIsLoadingPix(false);
                }
            };
            loadPix();
        }
    }, [isOpen, cobranca]);

    const shareWhatsApp = () => {
        if (!pixPayload || !cobranca) return;
        const valor = Number(cobranca.valor || 0);
        const message = `Olá! Segue o PIX para pagamento da fatura do streaming ${cobranca?.assinatura?.streaming?.apelido || cobranca?.assinatura?.streaming?.catalogo?.nome || ""}:\n\n${pixPayload}\n\nValor: ${format(valor)}`;
        const whatsapp = cobranca?.assinatura?.participante?.whatsappNumero;

        try {
            const link = whatsapp
                ? generateWhatsAppLink(whatsapp, message)
                : generateWhatsAppLinkTextOnly(message);
            window.open(link, "_blank");
        } catch (err) {
            toastError("Erro ao gerar link do WhatsApp. Verifique se o número é válido.");
        }
    };

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

                {/* 1. HERO SECTION: Valor e Status - Design Moderno com Gradiente */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-gray-100 mb-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-white p-6 shadow-sm border border-blue-50/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />

                    <div className="p-3 sm:p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex-shrink-0 relative z-10">
                        <Receipt className="text-blue-600 w-8 h-8 sm:w-10 sm:h-10" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full relative z-10">
                        <div className="min-w-0 space-y-1">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider leading-none">Fatura do Cliente</p>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate leading-tight">
                                {cobranca.assinatura.participante.nome}
                            </h3>
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <StatusBadge status={cobranca.status} className="scale-90 origin-left" />
                                <span className="text-[11px] font-semibold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                    {new Date(cobranca.periodoInicio).toLocaleDateString('pt-BR', { month: 'short' })} • {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', { month: 'short' })}
                                </span>
                            </div>
                        </div>

                        <div className="text-left sm:text-right flex-shrink-0 bg-white/60 p-3 rounded-xl border border-white backdrop-blur-sm sm:bg-transparent sm:border-none sm:p-0 w-full sm:w-auto mt-2 sm:mt-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Total</p>
                            <div className="flex items-baseline justify-start sm:justify-end gap-1">
                                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">
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

                {/* 5. QR Code para Pagamento (Se pendente e tiver chave) */}
                {(cobranca.status === 'pendente' || cobranca.status === 'atrasado') && cobranca.assinatura?.participante?.conta?.chavePix && (
                    <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm">
                        <div className="flex items-center justify-between w-full">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <QrCode size={16} className="text-primary" /> Pagamento
                            </h4>
                            <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">PIX Estático</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-center items-center w-full sm:w-[130px] rounded-lg transition-transform hover:scale-[1.02]">
                                {isLoadingPix ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                ) : (
                                    pixPayload ? <QRCode value={pixPayload} size={110} /> : <span className="text-xs text-gray-400">Erro QR</span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Copia e Cola</label>
                                <div className="flex items-stretch gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixPayload || "Gerando..."}
                                        className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg pr-2 pl-3 py-2 text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary truncate h-10"
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <Button
                                        onClick={() => handleCopy(pixPayload)}
                                        variant="secondary"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="font-bold gap-1 text-primary bg-primary/10 hover:bg-primary/20 transition-all h-10 px-3 w-auto min-w-0"
                                        title="Copiar Payload"
                                    >
                                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </Button>
                                    <Button
                                        onClick={shareWhatsApp}
                                        variant="secondary"
                                        disabled={!pixPayload || isLoadingPix}
                                        className="font-bold gap-1 text-green-700 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 transition-all h-10 px-3 w-auto min-w-0"
                                        title="Compartilhar pelo WhatsApp"
                                    >
                                        <MessageCircle size={16} />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Escaneie o código ou use a chave gerada acima.</p>
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
                        {cobranca.status === 'aguardando_aprovacao' && isAdmin && (
                            <div className="space-y-4 pt-2">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                                        Ao <strong>Aprovar</strong>, a assinatura será reativada (se necessário) e o participante verá a fatura como paga. Ao <strong>Rejeitar</strong>, ele será notificado para enviar um arquivo válido.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-11"
                                        onClick={handleAprovar}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Aprovar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 font-bold h-11"
                                        onClick={handleRejeitar}
                                        variant="secondary"
                                        disabled={isProcessing}
                                    >
                                        Rejeitar
                                    </Button>
                                </div>
                            </div>
                        )}
                        {cobranca.status === 'aguardando_aprovacao' && !isAdmin && (
                            <div className="mt-2 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                                <p className="text-xs text-amber-700 font-medium text-center">
                                    Comprovante em análise pelo administrador.
                                </p>
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

                {/* Ações do Footer (Padrão Mobile-First empilhado, desktop horizontal) */}
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-6 w-full">
                    <Button onClick={onClose} variant="outline" className="w-full sm:w-auto h-11 sm:mr-auto font-semibold">
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
