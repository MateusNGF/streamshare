import { FileText, Calendar, DollarSign, Eye, EyeOff, Hash, Trash, ReceiptText } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LoteTrackingBadge } from "./LoteTrackingBadge";
import { getLoteActorName } from "@/lib/financeiro-utils";

interface LoteCardProps {
    lote: any;
    onViewDetails: (id: number) => void;
    onCancelLote?: (id: number) => void;
    isAdmin?: boolean;
}

export function LoteCard({ lote, onViewDetails, onCancelLote, isAdmin = false }: LoteCardProps) {
    const isPendente = lote.status === "pendente";
    const isAprovacao = lote.status === "aguardando_aprovacao";
    const isPago = lote.status === "pago";

    const actorName = getLoteActorName(lote, isAdmin);

    return (
        <div className={cn(
            "group bg-white rounded-[24px] border p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col gap-4 flex-1 h-full min-w-[280px]",
            isPendente ? "border-amber-100 hover:border-amber-200 hover:shadow-md" :
                isPago ? "border-green-100 hover:border-green-200" :
                    "border-gray-100 hover:border-blue-100 hover:shadow-md"
        )}>
            {/* Background decor */}
            {isPago && <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />}
            {isPendente && <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none" />}

            {/* Header */}
            <div className="flex justify-between items-start gap-4 z-10 w-full">
                <div className="flex items-center gap-3 max-w-[calc(100%-80px)]">
                    <div className={cn(
                        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl shadow-sm border",
                        isPago ? "bg-green-50 border-green-100 text-green-600" :
                            isPendente ? "bg-amber-50 border-amber-100 text-amber-600" :
                                "bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                        <ReceiptText size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <LoteTrackingBadge
                            id={lote.id}
                            expiresAt={lote.expiresAt}
                            referenciaMes={lote.referenciaMes}
                            layout="card"
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate flex-1" title={actorName}>
                                {actorName}
                            </p>
                        </div>
                    </div>
                </div>
                <StatusBadge status={lote.status} className="scale-90 origin-top-right shadow-sm flex-shrink-0" />
            </div>

            {/* Details Grid */}
            <div className="flex flex-1 justify-between items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 z-10 text-sm mt-auto w-full">
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={12} /> Data Criação
                    </span>
                    <span className="font-bold text-gray-700 mt-1 truncate">{new Date(lote.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex flex-col items-end text-right flex-1 min-w-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                        Valor Total <DollarSign size={12} />
                    </span>
                    <div className="flex flex-col items-end w-full">
                        <span className="font-black text-gray-900 mt-1 leading-none text-lg truncate w-full">{formatCurrency(Number(lote.valorTotal), lote.moeda || 'BRL')}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter truncate w-full">
                            {lote.cobrancas?.length || 0} {(lote.cobrancas?.length || 0) === 1 ? 'item' : 'itens'} consol.
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1 z-10 w-full mt-2">
                {(isPendente || isAprovacao) && onCancelLote && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelLote(lote.id)}
                        className="flex-1 w-full sm:w-auto border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 justify-center rounded-xl"
                    >
                        <Trash size={14} className="mr-1.5" /> Cancelar
                    </Button>
                )}
                <Button
                    variant={isPendente ? "default" : "outline"}
                    size="sm"
                    onClick={() => onViewDetails(lote.id)}
                    className={cn(
                        "flex-1 w-full sm:w-auto justify-center rounded-xl",
                        !isPendente && "border-gray-200 text-gray-700 hover:bg-gray-50",
                        isPendente && "shadow-md hover:shadow-lg transition-shadow"
                    )}
                >
                    <Eye size={14} className="mr-1.5" />
                    {isPendente ? (isAdmin ? 'Analisar Lote' : 'Pagar Lote') : 'Detalhes'}
                </Button>
            </div>
        </div>
    );
}
