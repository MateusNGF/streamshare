"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { LotesTable } from "@/components/faturas/LotesTable";
import { ModalPagamentoLote } from "@/components/faturas/ModalPagamentoLote";
import { useState, useEffect, useMemo } from "react";
import { useActionError } from "@/hooks/useActionError";
import { useSearchParams } from "next/navigation";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";

interface GerenciarLotesClientProps {
    initialLotes: any[];
}

export function GerenciarLotesClient({ initialLotes }: GerenciarLotesClientProps) {
    const [lotes, setLotes] = useState(initialLotes);
    const [selectedLote, setSelectedLote] = useState<any>(null);
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        q: "",
        status: "all"
    });

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
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilterValues({
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
                { label: "Pago", value: "pago" },
                { label: "Cancelado", value: "cancelado" }
            ]
        }
    ];

    const filteredLotes = useMemo(() => {
        return lotes.filter(lote => {
            // Filter by search query
            if (filterValues.q) {
                const search = filterValues.q.toLowerCase();
                const matchesId = String(lote.id).includes(search);
                const matchesName = lote.participante?.nome?.toLowerCase().includes(search);
                const matchesEmail = lote.participante?.email?.toLowerCase().includes(search);
                if (!matchesId && !matchesName && !matchesEmail) return false;
            }

            // Filter by status
            if (filterValues.status && filterValues.status !== "all") {
                if (lote.status !== filterValues.status) return false;
            }

            return true;
        });
    }, [lotes, filterValues]);

    return (
        <PageContainer>
            <PageHeader
                title="Gestão de Lotes"
                description="Valide os pagamentos consolidados enviados pelos participantes."
            />

            <div className="mt-8 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <GenericFilter
                        filters={filterConfigs}
                        values={filterValues}
                        onChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                <LotesTable
                    lotes={filteredLotes}
                    onViewDetails={handleViewLote}
                    isAdmin={true}
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
