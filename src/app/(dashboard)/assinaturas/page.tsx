
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

    const results = await Promise.all([
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

    const [assinaturasRes, participantesRes, streamingsRes, kpisRes] = results;

    const hasError = results.some(r => !r.success);
    const errorMsg = hasError ? "Algumas informações de assinaturas não puderam ser carregadas." : undefined;

    return (
        <AssinaturasClient
            initialSubscriptions={assinaturasRes.data || []}
            participantes={participantesRes.data || []}
            streamings={streamingsRes.data || []}
            kpis={kpisRes.data || { totalAtivas: 0, totalSuspensas: 0, receitaMensalEstimada: 0, totalAssinaturas: 0 }}
            error={errorMsg}
        />
    );
}
