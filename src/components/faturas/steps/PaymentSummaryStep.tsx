"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StepContainer } from "@/components/ui/step-modal";
import { Receipt, Copy, MessageCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { LoteCompositionStrip } from "../LoteCompositionStrip";
import { AlertCircle } from "lucide-react";

interface PaymentSummaryStepProps {
    step: number;
    valor: number;
    id: string | number;
    status: string;
    isAdmin: boolean;
    format: (val: number) => string;
    cobrancas: any[];
    pixData?: {
        payload: string;
        isLoading: boolean;
        chavePix?: string;
    };
    onCopyPix: () => void;
    onShareWhatsapp: () => void;
    isCopied: boolean;
}

export function PaymentSummaryStep({
    step,
    valor,
    id,
    status,
    isAdmin,
    format,
    cobrancas,
    pixData,
    onCopyPix,
    onShareWhatsapp,
    isCopied
}: PaymentSummaryStepProps) {
    const isLote = Array.isArray(cobrancas) && cobrancas.length > 1;

    return (
        <StepContainer step={step} className="space-y-4">
            <div className="bg-zinc-50 rounded-[32px] border border-zinc-100 p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div className="space-y-3 w-full">
                        {isLote ? (
                            <LoteCompositionStrip
                                cobrancas={cobrancas}
                                total={valor}
                                format={format}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Receipt size={14} className="text-primary opacity-60" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    Valor {isLote ? "do Lote" : "da Fatura"}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                            <div className="space-y-1">
                                {!isLote && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Total</span>
                                    </div>
                                )}
                                <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">{format(valor)}</h2>
                            </div>
                            <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                                    {isLote ? "Lote" : "Fatura"}
                                </span>
                                <span className="text-lg font-black text-primary leading-none">#{id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isAdmin && (status === "pendente" || status === "atrasado") && (
                !pixData?.chavePix ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center bg-zinc-50 rounded-[32px] border border-zinc-100">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-zinc-900 text-lg">Pagamento Indisponível</h3>
                            <p className="text-sm text-zinc-500 max-w-[300px]">O administrador ainda não configurou a chave PIX para recebimento.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-5 rounded-[32px] border border-zinc-100 shadow-sm ring-1 ring-blue-50 group">
                        <div className="bg-zinc-50 p-2.5 rounded-[28px] border border-zinc-100 transition-transform group-hover:scale-105 duration-500">
                            <div className="p-1.5 bg-white rounded-xl shadow-inner">
                                {pixData.isLoading ? (
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-zinc-200" size={24} />
                                    </div>
                                ) : pixData.payload ? (
                                    <QRCode value={pixData.payload} size={84} />
                                ) : (
                                    <div className="w-20 h-20 flex items-center justify-center bg-red-50 text-red-500 font-black text-xs">ERRO</div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">PIX Copia e Cola</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={onCopyPix} variant="outline" size="sm" className={cn("flex-1 text-[11px] h-9 gap-2 rounded-xl font-bold transition-all", isCopied ? "border-green-200 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>
                                    {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {isCopied ? "Copiado!" : "Copiar PIX"}
                                </Button>
                                <Button onClick={onShareWhatsapp} variant="outline" size="sm" className="flex-1 text-[11px] h-9 gap-2 rounded-xl border-green-100 text-green-700 font-bold hover:bg-green-50 transition-all">
                                    <MessageCircle size={14} /> WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            )}

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm mt-4">
                <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
                    <span className="text-xs font-bold text-zinc-600">
                        {isLote ? "Composição do Lote" : "Serviço Vinculado"}
                    </span>
                    {isLote && <Badge variant="outline">{cobrancas.length} itens</Badge>}
                </div>
                <div className={cn("overflow-y-auto px-4 py-1 divide-y divide-zinc-50", isLote ? "max-h-[120px]" : "")}>
                    {cobrancas.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <StreamingLogo
                                    name={c.assinatura.streaming.catalogo.nome}
                                    iconeUrl={c.assinatura.streaming.catalogo.iconeUrl}
                                    color={c.assinatura.streaming.catalogo.corPrimaria}
                                    size="xs"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-zinc-800 text-xs tracking-tight">
                                        {c.assinatura.streaming.apelido || c.assinatura.streaming.catalogo.nome}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 font-medium">
                                        Fatura #{c.id} {c.dataVencimento && `• Vencimento: ${new Date(c.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                                    </span>
                                </div>
                            </div>
                            <span className="font-black text-zinc-900 text-xs">{format(Number(c.valor))}</span>
                        </div>
                    ))}
                </div>
            </div>
        </StepContainer>
    );
}
