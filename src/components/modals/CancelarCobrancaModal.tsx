import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface CancelarCobrancaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export function CancelarCobrancaModal({
    isOpen,
    onClose,
    onConfirm,
    loading
}: CancelarCobrancaModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancelar Cobrança"
            footer={
                <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="w-full sm:w-auto"
                        disabled={loading}
                    >
                        {loading ? "Confirmando..." : "Confirmar"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-600">
                    Tem certeza que deseja cancelar esta cobrança? Esta ação não pode ser desfeita.
                </p>
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                        <p className="font-medium">Atenção</p>
                        <p>Isso cancelará apenas esta cobrança específica. A assinatura continuará ativa para os próximos recorrências.</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
