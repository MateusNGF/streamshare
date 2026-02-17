import { getCatalogos } from "@/actions/streamings";
import { CatalogoClient } from "@/components/admin/CatalogoClient";

export const metadata = {
    title: "Catálogo Global | StreamShare",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
    const res = await getCatalogos();

    return (
        <CatalogoClient
            initialData={'data' in res ? (res.data || []) : []}
            error={!res.success ? "Falha ao carregar catálogo." : undefined}
        />
    );
}
