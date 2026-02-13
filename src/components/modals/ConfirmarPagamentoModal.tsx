import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface ConfirmarPagamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export function ConfirmarPagamentoModal({
    isOpen,
    onClose,
    onConfirm,
    loading
}: ConfirmarPagamentoModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmar Pagamento"
            footer={
                <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
                    <Button
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
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
                    Deseja confirmar o pagamento desta cobrança?
                </p>
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                        <p className="font-medium">Confirmação</p>
                        <p>O status da cobrança será alterado para "Pago" e a receita será contabilizada.</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
