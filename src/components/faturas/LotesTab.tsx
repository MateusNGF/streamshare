"use client";

import { LotesTable } from "./LotesTable";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { ModalPagamentoLote } from "./ModalPagamentoLote";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cancelarLotePagamento } from "@/actions/cobrancas";
import { useToast } from "@/hooks/useToast";
import { LoteCard } from "./LoteCard";
import { ViewMode } from "@/components/ui/ViewModeToggle";

interface LotesTabProps {
    lotes: any[];
    viewMode?: ViewMode;
}

export function LotesTab({ lotes, viewMode = "table" }: LotesTabProps) {
    const [selectedLote, setSelectedLote] = useState<any>(null);
    const searchParams = useSearchParams();

    const { success, error: toastError } = useToast();

    useEffect(() => {
        const loteId = searchParams.get("loteId");
        if (loteId && lotes.length > 0) {
            const lote = lotes.find(l => l.id === Number(loteId));
            if (lote) {
                setSelectedLote(lote);
            }
        }
    }, [searchParams, lotes]);

    const handleViewLote = (id: number) => {
        const lote = lotes.find(l => l.id === id);
        if (lote) {
            setSelectedLote(lote);
        }
    };

    const handleCancelLote = async (id: number) => {
        if (!confirm("Tem certeza que deseja cancelar este lote? As faturas voltarão a ficar disponíveis em 'Faturas em Aberto'.")) return;
        const result = await cancelarLotePagamento(id);
        if (result.success) {
            success("Lote cancelado com sucesso!");
        } else {
            toastError(result.error || "Erro ao cancelar lote.");
        }
    };

    return (
        <div className="space-y-6">
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lotes.map(lote => (
                        <LoteCard
                            key={lote.id}
                            lote={lote}
                            onViewDetails={handleViewLote}
                            onCancelLote={handleCancelLote}
                        />
                    ))}
                </div>
            ) : (
                <LotesTable
                    lotes={lotes}
                    onViewDetails={handleViewLote}
                    onCancelLote={handleCancelLote}
                    isAdmin={false}
                />
            )}

            {selectedLote && (
                <ModalPagamentoLote
                    isOpen={!!selectedLote}
                    onClose={() => setSelectedLote(null)}
                    lote={selectedLote}
                />
            )}
        </div>
    );
}
