import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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
                    Você tem certeza que deseja **anular** esta fatura específica?
                </p>

                <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3 border border-red-100">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm space-y-2">
                        <p className="font-bold">Informações Importantes:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Esta fatura deixará de ser cobrada e sumirá da lista de pendências do participante.</li>
                            <li>A ação é **irreversível**.</li>
                            <li>A assinatura do participante **continuará ativa** e novas faturas serão geradas normalmente no próximo ciclo.</li>
                            <li>Use isto apenas para correções manuais ou perdão de dívida.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
