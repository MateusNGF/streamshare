import { getCatalogos } from "@/actions/streamings";
import { CatalogoClient } from "@/components/admin/CatalogoClient";

export const metadata = {
    title: "Catálogo Global | StreamShare",
};

export default async function CatalogoPage() {
    const catalogos = await getCatalogos();

    return <CatalogoClient initialData={catalogos} />;
}
