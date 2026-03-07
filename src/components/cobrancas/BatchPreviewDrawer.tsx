"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { ArrowRight, User, Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { Badge } from "@/components/ui/Badge";

// Sub-components
import { BatchPreviewItemList } from "./batch/BatchPreviewItemList";
import { WhatsAppPreviewCard } from "./batch/WhatsAppPreviewCard";

interface BatchPreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    items: any[];
    total: number;
    loading?: boolean;
}

export function BatchPreviewDrawer({
    isOpen,
    onClose,
    onConfirm,
    items,
    total,
    loading = false
}: BatchPreviewDrawerProps) {
    const { format } = useCurrency();

    if (items.length === 0) return null;

    const participantName = items[0].assinatura.participante.nome || "Participante";

    // Create WhatsApp preview message
    const whatsappMessage = `Olá ${participantName}! 👋\n\nEstou gerando o lote de cobranças das suas assinaturas no StreamShare:\n\n${items.map(item => `- ${item.assinatura.streaming.catalogo.nome}: ${format(item.valor)}`).join('\n')}\n\n*Total: ${format(total)}*\n\nVou te enviar o PIX para pagamento em seguida. 👍`;

    const footer = (
        <div className="flex flex-col gap-3 w-full">
            <Button
                onClick={onConfirm}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-2xl h-14 font-black text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all group"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PROCESSANDO...</span>
                    </div>
                ) : (
                    <>
                        <span>GERAR LOTE AGORA</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </Button>
            <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-slate-400 font-bold hover:text-slate-600 h-10 rounded-xl"
            >
                REVISAR NOVAMENTE
            </Button>
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Revisão de Lote"
            footer={footer}
        >
            <div className="space-y-6 pb-20">
                <div className="space-y-1">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-black">
                        ETAPA FINAL
                    </Badge>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {participantName} • {items.length} {items.length === 1 ? 'fatura' : 'faturas'}
                    </p>
                </div>

                <BatchPreviewItemList items={items} total={total} />
                <WhatsAppPreviewCard message={whatsappMessage} />
            </div>
        </Drawer>
    );
}
