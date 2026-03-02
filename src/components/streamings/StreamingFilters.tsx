"use client";

import { GenericFilter } from "@/components/ui/GenericFilter";
import { useFilterParams } from "@/hooks/useFilterParams";

interface StreamingFiltersProps {
    streamings: any[];
}

export function StreamingFilters({ streamings }: StreamingFiltersProps) {
    const { filters, updateFilters } = useFilterParams();
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
        <div className="py-6">
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
                    },
                    {
                        key: "visibilidade",
                        type: "select",
                        label: "Visibilidade",
                        className: "w-full md:w-[150px]",
                        options: [
                            { label: "Público", value: "publico" },
                            { label: "Privado", value: "privado" }
                        ]
                    },
                    {
                        key: "valor",
                        type: "numberRange",
                        label: "Faixa de Preço",
                        placeholder: "Preço entre..."
                    }
                ]}
                values={{
                    searchTerm: filters.searchTerm || "",
                    catalogoId: filters.catalogoId || "all",
                    onlyFull: filters.onlyFull || "false",
                    visibilidade: filters.visibilidade || "all",
                    valor: filters.valor || ""
                }}
                onChange={(key, value) => {
                    updateFilters({ [key]: value });
                }}
                onClear={() => {
                    updateFilters({
                        searchTerm: "",
                        catalogoId: "",
                        onlyFull: "",
                        visibilidade: "",
                        valor: ""
                    });
                }}
            />
        </div>
    );
}
