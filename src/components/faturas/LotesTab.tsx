"use client";

import { LotesTable } from "./LotesTable";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { ModalPagamentoLote } from "./ModalPagamentoLote";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface LotesTabProps {
    lotes: any[];
}

export function LotesTab({ lotes }: LotesTabProps) {
    const [selectedLote, setSelectedLote] = useState<any>(null);
    const searchParams = useSearchParams();

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

    return (
        <div className="space-y-6">
            <LotesTable
                lotes={lotes}
                onViewDetails={handleViewLote}
            />

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
