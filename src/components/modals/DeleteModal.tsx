"use client";

import { Modal } from "@/components/ui/Modal";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    loading?: boolean;
    confirmDisabled?: boolean;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    loading,
    confirmDisabled,
}: DeleteModalProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 sm:flex-none justify-center"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading || confirmDisabled}
                        loading={loading}
                        className="flex-1 sm:flex-none justify-center"
                    >
                        {loading ? "Excluindo..." : "Excluir"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-600" size={32} />
                </div>
                <div className="text-gray-600">{message}</div>
            </div>
        </Modal>
    );
}
