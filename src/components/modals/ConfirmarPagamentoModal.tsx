"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle, UploadCloud, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Info, AlertOctagon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface ConfirmarPagamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (formData?: FormData) => void;
    selectedCobranca?: any;
    loading: boolean;
}

export function ConfirmarPagamentoModal({
    isOpen,
    onClose,
    onConfirm,
    selectedCobranca,
    loading
}: ConfirmarPagamentoModalProps) {
    const { format } = useCurrency();
    const [step, setStep] = useState<1 | 2>(1);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFile(null);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleConfirm = () => {
        const formData = new FormData();
        if (file) {
            formData.append("comprovante", file);
        }
        onConfirm(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmação de Recebimento"
            className="sm:max-w-[500px]"
            footer={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:justify-end">
                    {step === 1 ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="w-full sm:w-auto sm:mr-auto font-bold"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold"
                            >
                                Verificar Comprovante <ChevronRight size={16} />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="w-full sm:w-auto sm:mr-auto gap-2 font-bold"
                                disabled={loading}
                            >
                                <ChevronLeft size={16} /> Voltar
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 font-bold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Confirmando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} /> Confirmar Agora
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-6 py-2">
                {/* Stepper Indicator */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                        step === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : "bg-green-100 text-green-600 border border-green-200"
                    )}>
                        {step > 1 ? <CheckCircle2 size={16} /> : "1"}
                    </div>
                    <div className={cn("h-0.5 w-12 rounded-full transition-all", step > 1 ? "bg-green-500" : "bg-gray-100")} />
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                        step === 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : "bg-gray-100 text-gray-400"
                    )}>
                        2
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-gray-900 text-lg tracking-tight">Termos de Recebimento</h3>
                            <p className="text-sm text-gray-500 font-medium">Você está registrando um pagamento manual.</p>
                        </div>

                        {/* Card do Valor */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montante a Confirmar</span>
                            <div className="text-3xl font-black text-gray-900">
                                {selectedCobranca ? format(Number(selectedCobranca.valor)) : "---"}
                            </div>
                            <div className="flex items-center gap-1.5 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-bold text-blue-700">{selectedCobranca?.assinatura?.participante?.nome}</span>
                            </div>
                        </div>

                        {/* Impactos */}
                        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100 space-y-3">
                            <div className="flex items-center gap-2 text-amber-800 font-black text-[10px] uppercase tracking-wider">
                                <AlertOctagon size={14} className="text-amber-600" /> Impactos da confirmação manual
                            </div>
                            <ul className="text-[11px] text-amber-800/80 space-y-2 font-medium">
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <span>A fatura será marcada como <strong>"Pago"</strong> imediatamente na plataforma.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <span>O saldo <strong>NÃO</strong> transitará pela sua carteira digital StreamShare.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <span>Nenhuma taxa de serviço será descontada do seu saldo atual.</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-[10px] text-gray-400 italic text-center">
                            * Use isto apenas se o dinheiro já estiver disponível em sua conta pessoal.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-gray-900 text-lg tracking-tight">Anexar Comprovante</h3>
                            <p className="text-sm text-gray-500 font-medium">Vincule um arquivo para auditoria futura.</p>
                        </div>

                        <label className={cn(
                            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all group relative overflow-hidden py-10",
                            file ? "border-green-300 bg-green-50/40" : "border-gray-200 hover:bg-blue-50/40 hover:border-blue-400"
                        )}>
                            <div className="flex flex-col items-center justify-center px-4 relative z-10 text-center">
                                {file ? (
                                    <>
                                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110">
                                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-800 truncate max-w-[250px] font-black">{file.name}</p>
                                        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-2 hover:underline">Trocar arquivo</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-white transition-all shadow-sm group-hover:shadow-md border border-transparent group-hover:border-blue-100">
                                            <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">
                                            <span className="text-blue-600 group-hover:underline">Fazer upload do recibo</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1 italic">Arquivo opcional (Imagens ou PDF até 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </label>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <Info size={18} className="text-blue-600 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-900">Por que anexar?</p>
                                <p className="text-[11px] text-blue-700 leading-relaxed">
                                    Manter o comprovante ajuda você e o participante a resolverem eventuais disputas futuras sobre este pagamento.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
