
import { getAssinaturas } from "@/actions/assinaturas";
import AssinaturasClient from "./AssinaturasClient";

export default async function AssinaturasPage() {
    const assinaturas = await getAssinaturas();

    return <AssinaturasClient initialSubscriptions={assinaturas} />;
}
