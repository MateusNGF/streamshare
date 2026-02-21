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
                    Você está confirmando que recebeu o pagamento deste participante **manualmente** (por fora da plataforma).
                </p>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm space-y-2">
                        <p className="font-bold">Impactos desta ação:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>O status da fatura mudará para <strong>"Pago"</strong> imediatamente.</li>
                            <li>O valor <strong>NÃO</strong> passará pela sua carteira digital.</li>
                            <li>Nenhuma taxa de plataforma será descontada.</li>
                            <li>O participante receberá uma notificação de confirmação.</li>
                        </ul>
                    </div>
                </div>

                <p className="text-xs text-gray-500 italic">
                    * Use esta opção apenas se o dinheiro já estiver na sua conta pessoal.
                </p>
            </div>
        </Modal>
    );
}
