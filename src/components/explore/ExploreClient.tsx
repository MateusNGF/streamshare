"use client";

import { getPublicStreamings } from "@/actions/streamings";
import { StreamingCard } from "@/components/explore/StreamingCard";
import { SkeletonGrid } from "@/components/explore/StreamingCardSkeleton";
import { Button } from "@/components/ui/Button";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { CATALOGO_CATEGORIES } from "@/constants/catalogo";
import { useActionError } from "@/hooks/useActionError";
import { Compass, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface ExploreClientProps {
    initialStreamings: any[];
    initialNextCursor?: number;
    catalogos: any[];
    initialFilters: { search?: string; catalogoId?: string; categoria?: string; onlyMyAccount?: string; orderBy?: string };
    error?: string;
}

export function ExploreClient({ initialStreamings, initialNextCursor, catalogos, initialFilters, error }: ExploreClientProps) {
    useActionError(error);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [streamings, setStreamings] = useState(initialStreamings);
    const [nextCursor, setNextCursor] = useState(initialNextCursor);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        setStreamings(initialStreamings);
        setNextCursor(initialNextCursor);
    }, [initialStreamings, initialNextCursor]);

    const loadMore = async () => {
        if (!nextCursor || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await getPublicStreamings({
                ...initialFilters,
                catalogoId: initialFilters.catalogoId && initialFilters.catalogoId !== 'all' ? parseInt(initialFilters.catalogoId) : undefined,
                onlyMyAccount: initialFilters.onlyMyAccount === 'true',
                orderBy: initialFilters.orderBy as any,
                cursor: nextCursor
            });
            if (res.success) {
                setStreamings(prev => [...prev, ...(res.data || [])]);
                setNextCursor(res.nextCursor);
            }
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && nextCursor && !isLoadingMore && !isPending) {
                loadMore();
            }
        }, { rootMargin: "100px" });

        const target = document.querySelector("#load-more-trigger");
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [nextCursor, isLoadingMore, isPending]);

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
        <div className="w-full">
            <div className="py-6 space-y-4">
                {/* Quick Filters / Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => handleFilterChange("catalogoId", "all")}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${!initialFilters.catalogoId || initialFilters.catalogoId === "all"
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <Compass size={16} />
                        Todos
                    </button>
                    {catalogos.slice(0, 6).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange("catalogoId", cat.id.toString())}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2 ${initialFilters.catalogoId === cat.id.toString()
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {cat.iconeUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={cat.iconeUrl} alt={cat.nome} className="w-4 h-4 rounded-full object-cover" />
                            ) : null}
                            {cat.nome}
                        </button>
                    ))}
                </div>

                <GenericFilter
                    filters={[
                        {
                            key: "search",
                            type: "text",
                            placeholder: "Pelo que você está procurando hoje?",
                            className: "md:flex-[2]"
                        },
                        {
                            key: "categoria",
                            type: "select",
                            label: "Categoria",
                            placeholder: "Todas as categorias",
                            className: "md:flex-1",
                            options: CATALOGO_CATEGORIES.map(c => ({
                                label: c.label,
                                value: c.id
                            }))
                        },
                        {
                            key: "catalogoId",
                            type: "select",
                            label: "Serviço Específico",
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
                        },
                        {
                            key: "orderBy",
                            type: "select",
                            label: "Ordenar por",
                            placeholder: "Mais recentes",
                            className: "md:flex-[1]",
                            options: [
                                { label: "Mais recentes", value: "recent" },
                                { label: "Menor preço", value: "price_asc" },
                                { label: "Vagas acabando", value: "slots_asc" }
                            ]
                        }
                    ]}
                    values={{
                        search: initialFilters.search || "",
                        categoria: initialFilters.categoria || "all",
                        catalogoId: initialFilters.catalogoId || "all",
                        onlyMyAccount: initialFilters.onlyMyAccount || "false",
                        orderBy: initialFilters.orderBy || "recent"
                    }}
                    onChange={handleFilterChange}
                    onClear={() => {
                        startTransition(() => {
                            router.push(pathname);
                        });
                    }}
                />
            </div>

            {isPending ? (
                <SkeletonGrid count={6} />
            ) : streamings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {streamings.map((s) => (
                        <StreamingCard key={s.id} streaming={s} />
                    ))}
                    {/* Infinite Scroll Trigger */}
                    <div id="load-more-trigger" className="w-full h-10 col-span-1 md:col-span-2 lg:col-span-3 flex justify-center">
                        {isLoadingMore && <SkeletonGrid count={3} />}
                    </div>
                </div>
            ) : (
                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200 shadow-inner">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                        <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum streaming disponível</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Não encontramos vagas para os filtros selecionados.
                        Tente buscar por termos mais genéricos ou mudar o serviço.
                    </p>
                    <Button
                        onClick={() => router.push('/streamings?action=new')}
                        className="mx-auto flex items-center gap-2 px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        {initialFilters.search ? `Criar grupo de ${initialFilters.search}` : "Criar meu próprio grupo"}
                    </Button>
                </div>
            )}
        </div>
    );
}
