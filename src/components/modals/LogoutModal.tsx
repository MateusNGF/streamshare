"use client";

import { Modal } from "@/components/ui/modal";
import { LogOut, AlertTriangle } from "lucide-react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export function LogoutModal({ isOpen, onClose, onConfirm, loading }: LogoutModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sair da Conta"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? "Saindo..." : "Sair"}
                    </button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <p className="text-gray-600 text-lg">
                    Tem certeza que deseja sair da sua conta? <br />
                    Você precisará fazer login novamente para acessar o StreamShare.
                </p>
            </div>
        </Modal>
    );
}
