"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, ExternalLink, Check, Calendar, MessageCircle, AlertCircle } from "lucide-react";
import { gerarMensagemRenovacao } from "@/actions/grupos";
import { generateWhatsAppLinkTextOnly } from "@/lib/whatsapp-link-utils";
import { useToast } from "@/hooks/useToast";
import { format, setMonth, setYear, getYear, getMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GrupoRenovacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    grupoId: number;
    grupoNome: string;
}

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function GrupoRenovacaoModal({
    isOpen,
    onClose,
    grupoId,
    grupoNome,
}: GrupoRenovacaoModalProps) {
    const toast = useToast();
    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dataReferencia, setDataReferencia] = useState(new Date());

    // Generate years (Current - 1 to Current + 1)
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => {
        if (isOpen) {
            loadMensagem();
        }
    }, [isOpen, dataReferencia]);

    const loadMensagem = async () => {
        setLoading(true);
        try {
            const texto = await gerarMensagemRenovacao(grupoId, dataReferencia);
            setMensagem(texto);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao gerar mensagem");
            setMensagem("");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(mensagem);
            setCopied(true);
            toast.success("Mensagem copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Erro ao copiar mensagem");
        }
    };

    const handleOpenWhatsApp = () => {
        if (!mensagem) return;
        try {
            const link = generateWhatsAppLinkTextOnly(mensagem);
            window.open(link, "_blank");
        } catch {
            toast.error("Erro ao abrir WhatsApp");
        }
    };

    const handleMonthChange = (monthName: string) => {
        const monthIndex = MONTHS.indexOf(monthName);
        if (monthIndex >= 0) {
            // Create new date with day 1 to avoid month overflow (e.g. 31st Jan -> Feb)
            const newDate = new Date(getYear(dataReferencia), monthIndex, 1);
            setDataReferencia(newDate);
        }
    };

    const handleYearChange = (yearStr: string) => {
        const year = parseInt(yearStr);
        if (!isNaN(year)) {
            // Create new date with day 1
            const newDate = new Date(year, getMonth(dataReferencia), 1);
            setDataReferencia(newDate);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Renovação - ${grupoNome}`}
            footer={
                <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
                    <button
                        onClick={handleCopy}
                        disabled={loading || !mensagem}
                        className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {copied ? (
                            <>
                                <Check size={18} className="text-green-600" />
                                <span>Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy size={18} />
                                <span>Copiar</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleOpenWhatsApp}
                        disabled={loading || !mensagem}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} />
                        Enviar no WhatsApp
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Month/Year Selectors */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={18} className="text-primary" />
                        <label className="text-sm font-semibold text-gray-800">
                            Selecione o Período
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Select
                                value={MONTHS[getMonth(dataReferencia)]}
                                onValueChange={handleMonthChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-1/3">
                            <Select
                                value={getYear(dataReferencia).toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Message Preview */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageCircle size={18} className="text-primary" />
                        <label className="text-sm font-semibold text-gray-800">
                            Pré-visualização
                        </label>
                    </div>

                    <div
                        className="w-full bg-[#E5DDD5] rounded-xl p-4 md:p-6 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden"
                        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundSize: '400px' }}
                    >
                        {loading ? (
                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg">
                                <Spinner size="lg" />
                            </div>
                        ) : mensagem ? (
                            <div className="w-full max-w-sm ml-auto mr-auto md:mr-0 self-end">
                                <div className="bg-white rounded-lg rounded-tr-none shadow-sm p-3 relative">
                                    <pre className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800 font-sans">
                                        {mensagem}
                                    </pre>
                                    <div className="flex justify-end gap-1 mt-1 opacity-60">
                                        <span className="text-[10px] text-gray-500">
                                            {format(new Date(), "HH:mm")}
                                        </span>
                                        <Check size={14} className="text-blue-500" />
                                    </div>

                                    {/* Triangle for bubble */}
                                    <div className="absolute top-0 -right-2 w-0 h-0 border-[8px] border-t-white border-l-white border-r-transparent border-b-transparent"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl text-center max-w-xs shadow-sm">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <AlertCircle className="text-gray-400" size={24} />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Nenhuma mensagem</h4>
                                <p className="text-sm text-gray-500">
                                    Não há dados suficientes para gerar a mensagem de renovação para este mês.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="flex justify-center">
                    <p className="text-xs text-gray-400 text-center max-w-md">
                        Esta é uma simulação de como a mensagem aparecerá no WhatsApp.
                        Use o botão "Copiar Texto" caso o botão de abrir não funcione.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
