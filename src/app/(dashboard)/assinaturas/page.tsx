
import { getAssinaturas, getAssinaturasKPIs } from "@/actions/assinaturas";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import AssinaturasClient from "./AssinaturasClient";

interface AssinaturasPageProps {
    searchParams: {
        status?: string;
        streaming?: string;
        search?: string;
        criacao?: string;
        valor?: string;
        hasWhatsapp?: string;
    };
}

export default async function AssinaturasPage({ searchParams }: AssinaturasPageProps) {
    const valorParam = searchParams.valor ? JSON.parse(searchParams.valor) : null;
    const hasWhatsapp = searchParams.hasWhatsapp === "true" ? true : searchParams.hasWhatsapp === "false" ? false : undefined;

    const [assinaturas, participantes, streamings, kpis] = await Promise.all([
        getAssinaturas({
            status: searchParams.status,
            streamingId: searchParams.streaming,
            searchTerm: searchParams.search,
            dataInicioRange: searchParams.criacao,
            valorMin: valorParam?.min ? Number(valorParam.min) : undefined,
            valorMax: valorParam?.max ? Number(valorParam.max) : undefined,
            hasWhatsapp: hasWhatsapp
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
