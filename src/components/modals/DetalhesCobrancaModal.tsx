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
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    XCircle,
    CalendarDays
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

/**
 * Subcomponente para organizar as informações técnicas seguindo a Lei de Hick.
 * Escondemos informações de baixa frequência de uso para reduzir ruído visual.
 */
function TechnicalDetails({ cobranca, format, handleCopy, copied }: { cobranca: any, format: any, handleCopy: any, copied: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all mt-4 mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors focus:outline-none"
                type="button"
            >
                <div className="flex items-center gap-2 text-gray-500">
                    <Globe size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Informações de Processamento</span>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            <div className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isOpen ? "max-h-[500px] border-t border-gray-100" : "max-h-0"
            )}>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-violet-50 text-primary px-2 py-0.5 rounded-md border border-violet-100">
                                    {cobranca.gatewayProvider || "Manual"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Transação</span>
                            {(() => {
                                const isManual = !cobranca.gatewayProvider || cobranca.gatewayProvider.toLowerCase() === 'manual';
                                const displayId = isManual ? `INT-${cobranca.id}` : cobranca.gatewayTransactionId;

                                if (!displayId) return <span className="text-xs text-gray-300 italic block">N/A</span>;

                                return (
                                    <button
                                        onClick={() => handleCopy(displayId)}
                                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors bg-gray-50 px-2 py-1 rounded-md border border-gray-200 group w-full text-left"
                                        title={isManual ? "ID Interno (Manual)" : "ID do Gateway"}
                                    >
                                        <span className="font-mono truncate flex-1">{displayId}</span>
                                        {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400" />}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>

                    {cobranca.metadataJson && (cobranca.metadataJson.fee || cobranca.metadataJson.net) && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Taxa</p>
                                <p className="text-sm font-bold text-gray-700">{format(Number(cobranca.metadataJson.fee || 0))}</p>
                            </div>
                            <div className="bg-green-50/50 rounded-xl p-3 border border-green-100">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Líquido</p>
                                <p className="text-sm font-bold text-green-700">{format(Number(cobranca.metadataJson.net || cobranca.valor))}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
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

    const isPendingOrOverdue = cobranca.status === 'pendente' || cobranca.status === 'atrasado';
    const isWaitingApproval = cobranca.status === 'aguardando_aprovacao';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Fatura"
            className="sm:max-w-2xl"
            footer={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    {/* Botão de fechamento conforme MODALS.md (Ação Secundária no TOPO em mobile) */}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full sm:w-auto sm:mr-auto font-bold order-2 sm:order-1"
                    >
                        Fechar
                    </Button>

                    {/* Se houvesse uma ação primária de faturamento aqui, ela seria a order-1 para ficar na BASE em mobile */}
                </div>
            }
        >
            <div className="space-y-6">

                {/* 1. HERO SECTION: Valor e Status (Design System: rounded-3xl para KPIs) */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                    {/* Glassmorphism subtle effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />

                    <div className="relative z-10 space-y-3">
                        <StatusBadge status={cobranca.status} className="shadow-sm" />

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Ciclo</p>
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                                {format(Number(cobranca.valor))}
                            </h2>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <CalendarDays size={14} className="text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                                {new Date(cobranca.periodoInicio).toLocaleDateString('pt-BR', { month: 'short' })} • {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alerta de Remoção */}
                {cobranca.deletedAt && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-1">
                        <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900">Registro Arquivado</h4>
                            <p className="text-xs text-red-700 font-medium">
                                Esta cobrança foi removida do sistema em {formatDate(cobranca.deletedAt, true)}.
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. ÁREA DE PAGAMENTO PIX (AÇÃO PRINCIPAL) */}
                {isPendingOrOverdue && cobranca.assinatura?.participante?.conta?.chavePix && (
                    <div className="bg-violet-50/50 border border-violet-100 rounded-3xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-violet-100 text-primary">
                                <QrCode size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Pagamento Via PIX</h3>
                                <p className="text-[10px] text-gray-500 font-medium">Escaneie o código ou copie a chave abaixo</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-violet-100 shadow-sm">
                            <div className="flex justify-center items-center w-full sm:w-28 h-28 bg-gray-50 rounded-xl p-1.5 border border-gray-100 flex-shrink-0 transition-transform hover:scale-[1.02]">
                                {isLoadingPix ? (
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                ) : (
                                    pixPayload ? <QRCode value={pixPayload} size={100} /> : <span className="text-[10px] text-gray-400">Erro no QR</span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pix Copia e Cola</span>
                                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixPayload || "Gerando..."}
                                        className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary truncate h-10"
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleCopy(pixPayload)}
                                            variant="default"
                                            disabled={!pixPayload || isLoadingPix}
                                            className="flex-1 sm:flex-none h-10 px-4 bg-primary hover:bg-violet-700 text-white shadow-lg shadow-primary/20"
                                        >
                                            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </Button>
                                        <Button
                                            onClick={shareWhatsApp}
                                            variant="outline"
                                            disabled={!pixPayload || isLoadingPix}
                                            className="flex-1 sm:flex-none h-10 px-4 text-green-700 border-green-200 hover:bg-green-50"
                                        >
                                            <MessageCircle size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. COMPROVANTE E AÇÕES ADMIN */}
                {cobranca.comprovanteUrl && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                            <ImageIcon size={16} className="text-gray-400" />
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Comprovante de Pagamento</h4>
                        </div>

                        <div className="w-full flex justify-center bg-gray-50 rounded-xl p-2 max-h-[350px] overflow-auto border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={cobranca.comprovanteUrl}
                                alt="Comprovativo"
                                className="max-w-full object-contain rounded-lg shadow-sm"
                            />
                        </div>

                        {isWaitingApproval && isAdmin && (
                            <div className="pt-2 space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-800 leading-tight font-medium">
                                        Analise o anexo acima. <strong>Aprovar</strong> confirmará o recebimento e reativará acessos. <strong>Rejeitar</strong> solicitará um novo envio ao participante.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Ordem Mobile: Rejeitar (Secundária) em cima (order-1), Aprovar (Primária) em baixo (order-2) */}
                                    <Button
                                        className="sm:flex-1 h-12 text-sm font-bold bg-green-600 hover:bg-green-700 text-white order-2 sm:order-1 shadow-lg shadow-green-600/20"
                                        onClick={handleAprovar}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                                        Aprovar Comprovante
                                    </Button>
                                    <Button
                                        className="sm:flex-1 h-12 text-sm font-bold bg-white text-red-600 border-red-100 border-2 hover:bg-red-50 order-1 sm:order-2"
                                        onClick={handleRejeitar}
                                        disabled={isProcessing}
                                    >
                                        Rejeitar e Notificar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isWaitingApproval && !isAdmin && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-center gap-3">
                                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                                <p className="text-xs text-amber-800 font-bold uppercase tracking-tight">Em análise pelo administrador</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. GRID DE INFORMAÇÕES (DESIGN SYSTEM: rounded-2xl) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card Participante */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informações do Assinante</span>
                        <ParticipantSection
                            participant={cobranca.assinatura.participante}
                            streamingInfo={cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                        />
                    </div>

                    {/* Card Cronograma */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datas do Ciclo</span>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock size={14} />
                                    <span className="text-xs font-bold">Vencimento</span>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold",
                                    cobranca.status === 'atrasado' ? "text-red-600" : "text-gray-900"
                                )}>
                                    {formatDate(cobranca.dataVencimento)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <CheckCircle2 size={14} className={cobranca.dataPagamento ? "text-green-500" : ""} />
                                    <span className="text-xs font-bold">Pago em</span>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold",
                                    cobranca.dataPagamento ? "text-green-600" : "text-gray-300 italic"
                                )}>
                                    {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento, true).split(',')[0] : "Pendente"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. DETALHES TÉCNICOS (Accordion) */}
                <TechnicalDetails
                    cobranca={cobranca}
                    format={format}
                    handleCopy={handleCopy}
                    copied={copied}
                />

            </div>

            <ModalPagamentoCobranca
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                fatura={cobranca}
            />
        </Modal>
    );
}
