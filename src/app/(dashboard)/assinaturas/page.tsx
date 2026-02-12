
import { getAssinaturas, getAssinaturasKPIs } from "@/actions/assinaturas";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import AssinaturasClient from "./AssinaturasClient";

interface AssinaturasPageProps {
    searchParams: {
        status?: string;
        streaming?: string;
        search?: string;
    };
}

export default async function AssinaturasPage({ searchParams }: AssinaturasPageProps) {
    const [assinaturas, participantes, streamings, kpis] = await Promise.all([
        getAssinaturas({
            status: searchParams.status,
            streamingId: searchParams.streaming,
            searchTerm: searchParams.search
        }),
        getParticipantes(),
        getStreamings(),
        getAssinaturasKPIs()
    ]);

    return (
        <AssinaturasClient
            initialSubscriptions={assinaturas}
            participantes={participantes}
            streamings={streamings}
            kpis={kpis}
        />
    );
}

