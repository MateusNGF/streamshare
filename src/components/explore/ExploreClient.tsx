"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { StreamingCard } from "@/components/explore/StreamingCard";
import { Search, Compass } from "lucide-react";
import { useTransition } from "react";

interface ExploreClientProps {
    streamings: any[];
    catalogos: any[];
    initialFilters: { search?: string; catalogoId?: string; onlyMyAccount?: string };
}

export function ExploreClient({ streamings, catalogos, initialFilters }: ExploreClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all" && value !== "" && value !== "false") {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className={isPending ? "opacity-70 transition-opacity" : "transition-opacity"}>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-gray-200/30 mb-10 overflow-hidden relative">
                {/* Decorative background element for the filter bar */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <GenericFilter
                    filters={[
                        {
                            key: "search",
                            type: "text",
                            placeholder: "Pelo que você está procurando hoje?",
                            className: "md:flex-[2]"
                        },
                        {
                            key: "catalogoId",
                            type: "select",
                            label: "Serviço de Streaming",
                            placeholder: "Todos os serviços",
                            className: "md:flex-1",
                            options: catalogos.map(c => ({
                                label: c.nome,
                                value: c.id.toString(),
                                icon: c.iconeUrl,
                                color: c.corPrimaria
                            }))
                        },
                        {
                            key: "onlyMyAccount",
                            type: "switch",
                            label: "Filtrar apenas por streaming da minha conta",
                            className: "md:flex-1"
                        }
                    ]}
                    values={{
                        search: initialFilters.search || "",
                        catalogoId: initialFilters.catalogoId || "all",
                        onlyMyAccount: initialFilters.onlyMyAccount || "false"
                    }}
                    onChange={handleFilterChange}
                    onClear={() => {
                        startTransition(() => {
                            router.push(pathname);
                        });
                    }}
                />
            </div>

            {streamings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {streamings.map((s) => (
                        <StreamingCard key={s.id} streaming={s} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200 shadow-inner">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                        <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum streaming disponível</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Não encontramos vagas para os filtros selecionados.
                        Tente buscar por termos mais genéricos ou mudar o serviço.
                    </p>
                </div>
            )}
        </div>
    );
}
