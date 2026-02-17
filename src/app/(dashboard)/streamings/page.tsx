import { getStreamings } from "@/actions/streamings";
import { StreamingsClient } from "@/components/streamings/StreamingsClient";

export default async function StreamingsPage() {
    const res = await getStreamings();

    const serializedStreamings = (res.data || []).map(s => ({
        ...s,
        valorIntegral: Number(s.valorIntegral)
    }));

    return (
        <StreamingsClient
            initialData={serializedStreamings}
            serverError={!res.success ? "Falha ao carregar streamings." : undefined}
        />
    );
}
