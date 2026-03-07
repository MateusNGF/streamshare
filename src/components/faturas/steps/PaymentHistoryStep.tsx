"use client";

import { StepContainer, StepHeader } from "@/components/ui/step-modal";
import { cn } from "@/lib/utils";

interface PaymentHistoryStepProps {
    step: number;
    id: string | number;
    status: string;
    createdAt: string;
    updatedAt?: string;
    type: "lote" | "fatura";
}

export function PaymentHistoryStep({
    step,
    id,
    status,
    createdAt,
    updatedAt,
    type
}: PaymentHistoryStepProps) {
    const isLote = type === "lote";

    // Status normalization for both types
    const isSent = status !== "pendente" && status !== "atrasado";
    const isPaid = status === "pago";

    return (
        <StepContainer step={step} className="space-y-6">
            <StepHeader
                title="Caminho da Aprovação"
                description={`Timeline ${isLote ? "do Lote" : "da Fatura"} #${id}`}
            />

            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-zinc-100 px-2 pb-4">
                <div className="relative pl-10">
                    <div className="absolute left-1.5 top-0 w-5 h-5 rounded-full bg-green-500 shadow-lg shadow-green-100 border-4 border-white flex items-center justify-center" />
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-zinc-900 uppercase">
                            {isLote ? "Lote Criado" : "Fatura Emitida"}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">{new Date(createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="relative pl-10">
                    <div className={cn("absolute left-1.5 top-0 w-5 h-5 rounded-full shadow-lg border-4 border-white", isSent ? "bg-green-500 shadow-green-100" : "bg-zinc-200")} />
                    <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black uppercase", isSent ? "text-zinc-900" : "text-zinc-400")}>Comprovante Enviado</p>
                        <p className="text-xs text-zinc-500 font-medium">{isSent && updatedAt ? new Date(updatedAt).toLocaleString() : "Aguardando..."}</p>
                    </div>
                </div>

                <div className="relative pl-10">
                    <div className={cn("absolute left-1.5 top-0 w-5 h-5 rounded-full shadow-lg border-4 border-white", isPaid ? "bg-green-500 shadow-green-100" : "bg-zinc-200")} />
                    <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black uppercase", isPaid ? "text-zinc-900" : "text-zinc-400")}>Pagamento Aprovado</p>
                        <p className="text-xs text-zinc-500 font-medium">{isPaid ? "Liquidação confirmada pelo admin" : "Pendente"}</p>
                    </div>
                </div>
            </div>
        </StepContainer>
    );
}
