import { getParametros } from "@/actions/parametros";
import { ParametrosClient } from "@/components/admin/ParametrosClient";

export const metadata = {
    title: "Parâmetros | StreamShare",
};

export const dynamic = "force-dynamic";

export default async function ParametrosPage() {
    const parametros = await getParametros();

    return <ParametrosClient initialData={parametros} />;
}
