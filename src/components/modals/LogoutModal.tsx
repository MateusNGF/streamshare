"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
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
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto sm:mr-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading ? "Saindo..." : "Sair"}
                    </Button>
                </div>
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
