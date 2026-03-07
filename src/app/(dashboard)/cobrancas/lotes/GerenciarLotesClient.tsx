"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { LotesTable } from "@/components/faturas/LotesTable";
import { ModalPagamentoLote } from "@/components/faturas/ModalPagamentoLote";
import { useState, useEffect, useMemo } from "react";
import { useActionError } from "@/hooks/useActionError";
import { useSearchParams } from "next/navigation";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { useFilterParams } from "@/hooks/useFilterParams";

interface GerenciarLotesClientProps {
    initialLotes: any[];
}

export function GerenciarLotesClient({ initialLotes }: GerenciarLotesClientProps) {
    const [lotes, setLotes] = useState(initialLotes);
    const [selectedLote, setSelectedLote] = useState<any>(null);
    const { filters, updateFilters } = useFilterParams();

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

    const handleFilterChange = (key: string, value: string) => {
        updateFilters({ [key]: value });
    };

    const handleClearFilters = () => {
        updateFilters({
            q: "",
            status: "all"
        });
    };

    const filterConfigs: FilterConfig[] = [
        {
            key: "q",
            type: "text",
            placeholder: "Buscar por participante ou ID...",
            className: "flex-1"
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            options: [
                { label: "Pendente", value: "pendente" },
                { label: "Em Análise", value: "aguardando_aprovacao" },
                { label: "Pago", value: "pago" }
            ]
        }
    ];

    const filteredLotes = useMemo(() => {
        return lotes.filter(lote => {
            // Filter by search query
            const q = filters.q?.toLowerCase() || "";
            if (q) {
                const matchesId = String(lote.id).includes(q);
                const matchesName = lote.participante?.nome?.toLowerCase().includes(q);
                const matchesEmail = lote.participante?.email?.toLowerCase().includes(q);
                if (!matchesId && !matchesName && !matchesEmail) return false;
            }

            // Filter by status
            const status = filters.status || "all";
            if (status !== "all") {
                if (lote.status !== status) return false;
            }

            return true;
        });
    }, [lotes, filters]);

    return (
        <PageContainer>
            <PageHeader
                title="Gestão de Lotes"
                description="Valide os pagamentos consolidados enviados pelos participantes."
            />

            <div className="py-6">
                <GenericFilter
                    filters={filterConfigs}
                    values={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            <LotesTable
                lotes={filteredLotes}
                onViewDetails={handleViewLote}
                isAdmin={true}
            />

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
