"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileStack, AlertCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { BatchPreviewItemList } from "@/components/cobrancas/batch/BatchPreviewItemList";
import { WhatsAppPreviewCard } from "@/components/cobrancas/batch/WhatsAppPreviewCard";

interface ConfirmarGerarLoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    count: number;
    total: number;
    items: any[];
}

export function ConfirmarGerarLoteModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    count,
    total,
    items
}: ConfirmarGerarLoteModalProps) {
    const { format } = useCurrency();

    const participantName = items?.[0]?.assinatura?.participante?.nome || "Participante";

    // Create WhatsApp preview message (copied logic from old BatchPreviewDrawer)
    const whatsappMessage = items && items.length > 0
        ? `Olá ${participantName}! 👋\n\nEstou gerando o lote de cobranças das suas assinaturas no StreamShare:\n\n${items.map(item => `- ${item.assinatura.streaming.catalogo.nome}: ${format(item.valor)}`).join('\n')}\n\n*Total: ${format(total)}*\n\nVou te enviar o PIX para pagamento em seguida. 👍`
        : "";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gerar Lote de Cobrança"
            footer={
                <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto font-bold"
                        disabled={loading}
                    >
                        Revisar Seleção
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90"
                        disabled={loading}
                        loading={loading}
                    >
                        {loading ? "Gerando..." : "Gerar Lote Agora"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center py-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <FileStack className="text-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Confirmar Criação de Lote</h3>
                    <p className="text-gray-600 mt-2">
                        Você está consolidando <span className="font-bold text-primary">{count} {count === 1 ? 'fatura' : 'faturas'}</span> para <span className="font-bold text-slate-900">{participantName}</span>.
                    </p>
                </div>

                <BatchPreviewItemList items={items || []} total={total} />

                {whatsappMessage && (
                    <WhatsAppPreviewCard message={whatsappMessage} />
                )}



                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                    <AlertCircle className="shrink-0 mt-1" size={18} />
                    <div className="text-[13px] leading-relaxed">
                        <p>Ao gerar o lote, as faturas serão agrupadas e você será redirecionado para a página do lote para realizar o envio.</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
