"use client";

import { Modal } from "@/components/ui/modal";
import { AlertTriangle } from "lucide-react";

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    subscriptionEndDate?: Date | string | null;
}

export function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    subscriptionEndDate
}: CancelSubscriptionModalProps) {
    // Calculate formatted date if needed, or just say "no final do período atual"

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cancelar Assinatura">
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                        Tem certeza que deseja cancelar?
                    </h3>

                    <div className="space-y-2 text-gray-600">
                        <p>
                            Ao cancelar, você perderá acesso aos recursos <strong>PRO</strong> ao final do período atual.
                        </p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                            Sua assinatura continuará ativa até o fim do ciclo de cobrança.
                            <br />
                            Nenhuma cobrança adicional será realizada.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? "Processando..." : "Confirmar Cancelamento"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
