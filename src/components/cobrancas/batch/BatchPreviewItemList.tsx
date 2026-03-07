"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface BatchPreviewItemListProps {
    items: any[];
    total: number;
}

export function BatchPreviewItemList({ items, total }: BatchPreviewItemListProps) {
    const { format } = useCurrency();

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Itens Selecionados
            </h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {items.map((item, idx) => (
                    <div key={item.id} className={cn(
                        "p-4 flex items-center justify-between",
                        idx !== items.length - 1 && "border-b border-slate-50"
                    )}>
                        <div className="flex items-center gap-3">
                            <StreamingLogo
                                name={item.assinatura.streaming.catalogo.nome}
                                iconeUrl={item.assinatura.streaming.catalogo.iconeUrl}
                                color={item.assinatura.streaming.catalogo.corPrimaria}
                                size="sm"
                                rounded="lg"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm">
                                    {item.assinatura.streaming.catalogo.nome}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Vence em {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                        <span className="font-black text-slate-900 text-sm">
                            {format(item.valor)}
                        </span>
                    </div>
                ))}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-tight">Total do Lote</span>
                    <span className="font-black text-primary text-lg">
                        {format(total)}
                    </span>
                </div>
            </div>
        </div>
    );
}
