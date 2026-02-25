"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
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
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancelar Assinatura"
            footer={
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto sm:mr-auto"
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading ? "Processando..." : "Confirmar Cancelamento"}
                    </Button>
                </div>
            }
        >
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
        </Modal>
    );
}
