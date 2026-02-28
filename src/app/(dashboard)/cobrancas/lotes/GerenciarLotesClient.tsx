"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { LotesTable } from "@/components/faturas/LotesTable";
import { ModalPagamentoLote } from "@/components/faturas/ModalPagamentoLote";
import { useState, useEffect } from "react";
import { useActionError } from "@/hooks/useActionError";
import { useSearchParams } from "next/navigation";

interface GerenciarLotesClientProps {
    initialLotes: any[];
}

export function GerenciarLotesClient({ initialLotes }: GerenciarLotesClientProps) {
    const [lotes, setLotes] = useState(initialLotes);
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
        <PageContainer>
            <PageHeader
                title="Gestão de Lotes"
                description="Valide os pagamentos consolidados enviados pelos participantes."
            />

            <div className="mt-8">
                <LotesTable
                    lotes={lotes}
                    onViewDetails={handleViewLote}
                />
            </div>

            {selectedLote && (
                <ModalPagamentoLote
                    isOpen={!!selectedLote}
                    onClose={() => setSelectedLote(null)}
                    lote={selectedLote}
                    isAdmin={true}
                />
            )}
        </PageContainer>
    );
}
