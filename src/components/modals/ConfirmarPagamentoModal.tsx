import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertTriangle } from "lucide-react";

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
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-start gap-3 border border-yellow-200">
                    <AlertTriangle className="shrink-0 mt-0.5 text-yellow-600" size={20} />
                    <div className="text-sm space-y-3">
                        <p className="font-semibold text-yellow-900 text-base">Atenção ao Pagamento Manual</p>
                        <p>
                            Ao confirmar manualmente, o sistema entende que você recebeu este valor por fora da plataforma (ex: PIX pessoal, transferência ou dinheiro em espécie).
                        </p>
                        <div className="space-y-1.5">
                            <p className="font-medium">Consequências desta ação:</p>
                            <ul className="list-disc list-inside space-y-1.5 ml-1 text-yellow-900/90">
                                <li><strong>O status mudará para "Pago":</strong> O participante terá seu acesso liberado ou mantido.</li>
                                <li><strong>Sem saldo na plataforma:</strong> O valor integral <strong>não será adicionado</strong> à sua carteira digital, já que o pagamento não processou pelo nosso gateway.</li>
                                <li><strong>Taxas da plataforma:</strong> A taxa da plataforma não será descontada do seu saldo atual.</li>
                                <li><strong>Estornos e mediações:</strong> A plataforma não poderá estornar ou mediar disputas desse pagamento, pois a transação ocorreu fora do nosso sistema.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
