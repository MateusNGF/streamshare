import { getParametros } from "@/actions/parametros";
import { ParametrosClient } from "@/components/admin/ParametrosClient";

export const metadata = {
    title: "Parâmetros | StreamShare",
};

export const dynamic = "force-dynamic";

export default async function ParametrosPage() {
    const res = await getParametros();

    return (
        <ParametrosClient
            initialData={('data' in res && res.data) ? res.data : []}
            error={!res.success ? "Falha ao carregar parâmetros." : undefined}
        />
    );
}
