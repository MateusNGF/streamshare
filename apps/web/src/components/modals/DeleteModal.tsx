"use client";

import { Modal } from "@/components/ui/Modal";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}: DeleteModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/25 transition-all"
                    >
                        Excluir
                    </button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-600" size={32} />
                </div>
                <p className="text-gray-600">{message}</p>
            </div>
        </Modal>
    );
}
