"use client";

import { GenericFilter } from "@/components/ui/GenericFilter";

interface StreamingFiltersProps {
    streamings: any[];
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    onClear: () => void;
}

export function StreamingFilters({ streamings, filters, onFilterChange, onClear }: StreamingFiltersProps) {
    // Unique catalog options for the filter
    const catalogOptions = Array.from(
        new Set(streamings.map(s => JSON.stringify({ id: s.catalogo.id, nome: s.catalogo.nome })))
    )
        .map((json: any) => JSON.parse(json))
        .map((cat: any) => ({
            label: cat.nome,
            value: String(cat.id)
        }));

    return (
        <GenericFilter
            filters={[
                {
                    key: "searchTerm",
                    type: "text",
                    placeholder: "Buscar por serviço...",
                    className: "w-full md:w-auto flex-1"
                },
                {
                    key: "catalogoId",
                    type: "select",
                    label: "Tipo de Serviço",
                    className: "w-full md:w-[200px]",
                    options: catalogOptions
                },
                {
                    key: "onlyFull",
                    type: "switch",
                    label: "Apenas grupos lotados",
                    className: "w-auto"
                }
            ]}
            values={{
                searchTerm: filters.searchTerm,
                catalogoId: filters.catalogoId ? String(filters.filtersId || filters.catalogoId) : "all",
                onlyFull: String(filters.onlyFull || false)
            }}
            onChange={(key, value) => {
                if (key === 'catalogoId') {
                    onFilterChange(key, value === 'all' ? undefined : Number(value));
                } else if (key === 'onlyFull') {
                    onFilterChange(key, value === 'true');
                } else {
                    onFilterChange(key, value);
                }
            }}
            onClear={onClear}
        />
    );
}
