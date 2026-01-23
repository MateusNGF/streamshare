"use client";

import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface ConfirmPlanChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    planName: string;
    price: number;
    currentPlanName: string;
}

export function ConfirmPlanChangeModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    planName,
    price,
    currentPlanName
}: ConfirmPlanChangeModalProps) {
    const isUpgrade = price > 0; // Simplificação: se tem preço é upgrade/pago

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isUpgrade ? "Confirmar Assinatura" : "Alterar Plano"}
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`
                            px-6 py-2.5 font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2
                            ${isUpgrade
                                ? "bg-primary hover:bg-primary-600 text-white shadow-primary/25"
                                : "bg-gray-900 hover:bg-gray-800 text-white"
                            }
                        `}
                        disabled={loading}
                    >
                        {loading ? "Processando..." : "Confirmar Alteração"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className={`p-4 rounded-full mb-4 ${isUpgrade ? "bg-primary/10" : "bg-gray-100"}`}>
                    {isUpgrade ? (
                        <CheckCircle2 className="text-primary" size={32} />
                    ) : (
                        <AlertTriangle className="text-gray-600" size={32} />
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Você está mudando para o plano {planName}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="line-through opacity-70">{currentPlanName}</span>
                    <ArrowRight size={14} />
                    <span className="font-bold text-gray-900">{planName}</span>
                </div>

                <p className="text-gray-600 max-w-sm">
                    {isUpgrade
                        ? `Você será redirecionado para o pagamento seguro. O valor é de R$ ${price.toString().replace('.', ',')}/mês.`
                        : "Ao mudar para o plano gratuito, você perderá acesso aos recursos exclusivos do plano atual ao fim do ciclo."}
                </p>
            </div>
        </Modal>
    );
}
