"use client";

import { useTransition, useState } from "react";
import { solicitarSaque } from "@/actions/wallet";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast, ToastVariant } from "@/components/ui/Toast";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    pixKey: string;
    pixType: string;
}

export function WithdrawalModal({ isOpen, onClose, availableBalance, pixKey, pixType }: WithdrawalModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [toast, setToast] = useState<{ message: string, variant: ToastVariant } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amountStr = formData.get("amount") as string;

        // Remove currency symbols and parse
        const amount = parseFloat(amountStr.replace(/[^\d.,]/g, "").replace(",", "."));

        if (isNaN(amount) || amount < 10) {
            setToast({ message: "O valor mínimo para saque é R$ 10,00.", variant: "error" });
            return;
        }

        if (amount > availableBalance) {
            setToast({ message: "Saldo insuficiente.", variant: "error" });
            return;
        }

        startTransition(async () => {
            const result = await solicitarSaque(amount);

            if (result.success) {
                setToast({ message: "Saque solicitado com sucesso. Aguarde o processamento!", variant: "success" });
                router.refresh();
                setTimeout(onClose, 2000);
            } else {
                setToast({ message: result.error || "Erro ao solicitar saque", variant: "error" });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-gray-900/5 shadow-2xl">
                <div className="px-6 py-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Solicitar Saque</h2>
                        <span className="text-sm text-gray-500 font-medium tracking-tight">Retirada via PIX</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Disponível</p>
                            <p className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBalance)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Chave {pixType}</p>
                            <p className="text-sm font-semibold text-gray-700">{pixKey}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Valor do Saque (R$)
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-medium text-lg">
                                R$
                            </span>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                step="0.01"
                                min="10"
                                max={availableBalance}
                                required
                                defaultValue={availableBalance.toFixed(2)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <AlertCircle size={14} className="text-gray-400" />
                            Transferência será feita para a chave PIX salva nas configurações.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Confirmar Saque
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
