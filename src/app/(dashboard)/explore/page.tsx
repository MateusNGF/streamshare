import { getPublicStreamings, getCatalogos } from "@/actions/streamings";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { Compass } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explorer | StreamShare",
    description: "Encontre e solicite vagas nos melhores serviços de streaming com preços reduzidos.",
};

interface PageProps {
    searchParams: {
        search?: string;
        catalogoId?: string;
        onlyMyAccount?: string;
    };
}

export default async function ExplorePage({ searchParams }: PageProps) {
    const filters = {
        search: searchParams.search,
        catalogoId: searchParams.catalogoId,
        onlyMyAccount: searchParams.onlyMyAccount
    };

    // Fetch data in parallel
    const [streamingsRes, catalogosRes] = await Promise.all([
        getPublicStreamings({
            search: filters.search,
            catalogoId: filters.catalogoId ? parseInt(filters.catalogoId) : undefined,
            onlyMyAccount: filters.onlyMyAccount === 'true'
        }),
        getCatalogos()
    ]);

    const error = streamingsRes.error || catalogosRes.error;

    return (
        <div className="py-6 md:py-12">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Compass size={24} />
                    </div>
                    <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Discovery</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Explorer
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl font-medium leading-relaxed">
                    Acesse os melhores serviços do mundo dividindo a conta com segurança.
                    Encontre grupos abertos e economize até 80% todo mês.
                </p>
            </div>

            <ExploreClient
                streamings={streamingsRes.data || []}
                catalogos={catalogosRes.data || []}
                initialFilters={filters}
                error={error}
            />
        </div>
    );
}
