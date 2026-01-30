import { getGrupos } from "@/actions/grupos";
import { GruposClient } from "@/components/grupos/GruposClient";

export const metadata = {
    title: "Grupos | StreamShare",
    description: "Gerencie seus grupos de streamings",
};

export default async function GruposPage() {
    const grupos = await getGrupos();

    return <GruposClient initialGrupos={grupos} />;
}
