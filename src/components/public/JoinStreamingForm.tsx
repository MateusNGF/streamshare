"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { publicSubscribe } from "@/actions/public";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectGroup, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { FrequenciaPagamento } from "@prisma/client";
import { useCurrency } from "@/hooks/useCurrency";
import { QuantityInput } from "@/components/ui/QuantityInput";

import { Modal } from "@/components/ui/Modal";
import { User, LogOut, CheckCircle, Shield, Info, CreditCard, QrCode } from "lucide-react";
import Link from "next/link";
import { PendingInvoiceModal } from "@/components/modals/PendingInvoiceModal";

interface JoinStreamingFormProps {
    token: string;
    streamingName: string;
    valorPorVaga: number;
    enabledFrequencies?: string; // comma separated string e.g. "mensal,anual"
    loggedUser?: {
        userId: number; // Added userId
        nome: string;
        email: string;
        whatsappNumero: string;
        cpf: string;
    } | null;
    vagasRestantes?: number;
    isPrivateInvite?: boolean;
    privateInviteToken?: string;
}

const INTERVALOS_MESES: Record<string, number> = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
};

const frequencyLabels: Record<FrequenciaPagamento, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
};

export function JoinStreamingForm({ token, streamingName, valorPorVaga, enabledFrequencies, loggedUser, vagasRestantes, isPrivateInvite, privateInviteToken }: JoinStreamingFormProps) {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const { format } = useCurrency();
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    const availableFrequencies = (enabledFrequencies || "mensal")
        .split(",")
        .map(f => f.trim() as FrequenciaPagamento);

    const [formData, setFormData] = useState({
        nome: loggedUser?.nome || "",
        email: loggedUser?.email || "",
        whatsappNumero: loggedUser?.whatsappNumero || "",
        cpf: loggedUser?.cpf || "",
        frequencia: availableFrequencies[0] || "mensal" as FrequenciaPagamento,
        quantidade: 1,
        metodoPagamento: 'PIX' as 'PIX' | 'CREDIT_CARD'
    });

    const handleConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const processSubmission = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        try {
            const result = await publicSubscribe({
                token, // Public token of the streaming (used for general validation if needed)
                userId: loggedUser?.userId,
                isPrivateInvite,
                privateInviteToken,
                ...formData
            }) as any;

            if (result?.success) {
                if (result.checkoutData) {
                    setCheckoutData(result.checkoutData);
                    setShowPendingModal(true);
                    success("Inscrição realizada! Aguardando pagamento.");
                } else {
                    success("Inscrição realizada com sucesso! O administrador entrará em contato.");
                    router.push("/faturas");
                    router.refresh();
                }
            } else {
                toastError(result?.error || "Erro ao realizar inscrição");
            }
        } catch (err: any) {
            toastError("Ocorreu um erro ao processar sua solicitação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
                <div className="bg-gray-50/50 rounded-2xl p-5 text-left border border-gray-100 space-y-4 mb-6 transition-all hover:border-primary/30 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />

                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                <User size={14} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificado como</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Logado</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-base font-black text-gray-900 group-hover:text-primary transition-colors">{loggedUser?.nome}</p>
                        <p className="text-sm text-gray-500 font-medium">{loggedUser?.email}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 relative z-10">
                        {loggedUser?.cpf ? (
                            <div className="flex items-center gap-1.5">
                                <Shield size={12} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">CPF: {loggedUser.cpf}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <Info size={12} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">CPF Não informado</span>
                            </div>
                        )}
                        <Link
                            href="/logout"
                            className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary/70 transition-colors uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <LogOut size={10} />
                            Sair
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frequência de Pagamento</label>
                        <Select
                            value={formData.frequencia}
                            onValueChange={(val) => setFormData({ ...formData, frequencia: val as FrequenciaPagamento })}
                        >
                            <SelectTrigger className="h-16 rounded-2xl border-gray-100 bg-white shadow-sm hover:border-primary/20 transition-all text-base font-bold">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                                <SelectGroup>
                                    {availableFrequencies.map((freq) => (
                                        <SelectItem key={freq} value={freq} className="py-4">
                                            {frequencyLabels[freq] || freq}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Método de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, metodoPagamento: 'PIX' })}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${formData.metodoPagamento === 'PIX'
                                ? 'border-primary bg-primary/[0.03] text-primary shadow-lg shadow-primary/5'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            <QrCode size={24} className={formData.metodoPagamento === 'PIX' ? 'opacity-100' : 'opacity-40'} />
                            <span className="text-xs font-black uppercase tracking-wider">PIX</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, metodoPagamento: 'CREDIT_CARD' })}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${formData.metodoPagamento === 'CREDIT_CARD'
                                ? 'border-primary bg-primary/[0.03] text-primary shadow-lg shadow-primary/5'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            <CreditCard size={24} className={formData.metodoPagamento === 'CREDIT_CARD' ? 'opacity-100' : 'opacity-40'} />
                            <span className="text-xs font-black uppercase tracking-wider">Cartão</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantidade de Vagas</label>
                    <QuantityInput
                        value={formData.quantidade}
                        onValueChange={(val) => setFormData({ ...formData, quantidade: val })}
                        min={1}
                        max={vagasRestantes || 10}
                        className="h-16"
                    />
                </div>

                <div className="flex flex-col w-full bg-primary/[0.03] rounded-2xl px-4 py-2 border border-primary/10 flex items-center justify-center transition-all">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{formData.quantidade > 1 ? "Total do Ciclo" : "Valor do Ciclo"}</span>
                        <p className="text-2xl font-black text-primary tracking-tighter">
                            {format(valorPorVaga * (INTERVALOS_MESES[formData.frequencia] || 1) * formData.quantidade)}
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-16 text-lg font-black mt-2 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 group"
                    disabled={loading || (vagasRestantes !== undefined && vagasRestantes <= 0)}
                >
                    {loading ? (
                        <Spinner size="sm" color="white" />
                    ) : vagasRestantes !== undefined && vagasRestantes <= 0 ? (
                        "Vagas Esgotadas"
                    ) : (
                        <div className="flex items-center gap-3">
                            Confirmar Assinatura
                            <CheckCircle size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    )}
                </Button>

                <p className="text-[11px] md:text-xs text-gray-400 text-center leading-relaxed">
                    Ao assinar, você concorda com nossos{" "}
                    <Link href="/termos-de-uso" className="font-bold text-gray-600 hover:text-primary underline decoration-gray-200 transition-colors">
                        termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link href="/politica-de-privacidade" className="font-bold text-gray-600 hover:text-primary underline decoration-gray-200 transition-colors">
                        política de privacidade
                    </Link>.
                </p>
            </form>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Assinatura"
                footer={(
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                            Cancelar
                        </Button>
                        <Button className="flex-1" onClick={processSubmission} disabled={loading}>
                            {loading ? <Spinner size="sm" color="white" /> : "Confirmar e Assinar"}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            ⚠️
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-amber-900">Atenção às consequências</p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Você está prestes a entrar em um grupo de compartilhamento. Por favor, leia atentamente:
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] mt-0.5 shrink-0">✓</div>
                            <p className="text-sm text-gray-600">
                                {formData.quantidade > 1 ? (
                                    <>Uma cobrança de <span className="font-black text-gray-900">{format(valorPorVaga * (INTERVALOS_MESES[formData.frequencia] || 1) * formData.quantidade)}</span> será gerada referente às <span className="font-bold">{formData.quantidade} vagas</span>.</>
                                ) : (
                                    <>Uma cobrança de <span className="font-black text-gray-900">{format(valorPorVaga * (INTERVALOS_MESES[formData.frequencia] || 1))}</span> será gerada imediatamente para iniciar seu acesso.</>
                                )}
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] mt-0.5 shrink-0">✓</div>
                            <p className="text-sm text-gray-600">
                                Esta é uma assinatura recorrente com renovação <span className="font-bold text-gray-900 capitalize">{frequencyLabels[formData.frequencia]}</span>.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] mt-0.5 shrink-0">✓</div>
                            <p className="text-sm text-gray-600">
                                Os dados de acesso (Login/Senha) serão liberados no seu painel assim que o pagamento for confirmado pelo sistema.
                            </p>
                        </li>
                    </ul>

                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center">
                            Ao confirmar, você declara estar ciente dos termos acima.
                        </p>
                    </div>
                </div>
            </Modal>

            <PendingInvoiceModal
                isOpen={showPendingModal}
                onClose={() => {
                    setShowPendingModal(false);
                    router.push("/faturas");
                    router.refresh();
                }}
                checkoutData={checkoutData}
            />
        </>
    );
}
