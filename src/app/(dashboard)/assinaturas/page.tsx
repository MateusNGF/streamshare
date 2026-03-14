import { getAssinaturas, getAssinaturasKPIs } from "@/actions/assinaturas";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { getCurrentPlan } from "@/actions/planos";
import AssinaturasClient from "./AssinaturasClient";

interface AssinaturasPageProps {
    searchParams: {
        status?: string;
        streaming?: string;
        participante?: string;
        search?: string;
        criacao?: string;
        vencimento?: string;
        valor?: string;
        hasWhatsapp?: string;
    };
}

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Minhas Assinaturas | StreamShare",
    description: "Gerencie suas assinaturas ativas, participantes e valores mensais.",
};

export default async function AssinaturasPage({ searchParams }: AssinaturasPageProps) {
    let valorParam = null;
    try {
        if (searchParams.valor) {
            valorParam = JSON.parse(searchParams.valor);
        }
    } catch (e) {
        console.error("Failed to parse valor Param", e);
    }

    const hasWhatsapp = searchParams.hasWhatsapp === "true" ? true : searchParams.hasWhatsapp === "false" ? false : undefined;

    const results = await Promise.all([
        getAssinaturas({
            status: searchParams.status,
            streamingId: searchParams.streaming,
            participanteId: searchParams.participante,
            searchTerm: searchParams.search,
            dataInicioRange: searchParams.criacao,
            dataVencimentoRange: searchParams.vencimento,
            valorMin: valorParam?.min ? Number(valorParam.min) : undefined,
            valorMax: valorParam?.max ? Number(valorParam.max) : undefined,
            hasWhatsapp: hasWhatsapp
        }),
        getParticipantes(),
        getStreamings(),
        getAssinaturasKPIs(),
        getCurrentPlan()
    ]);

    const [assinaturasRes, participantesRes, streamingsRes, kpisRes, planoRes] = results;

    const hasError = results.some(r => !r.success);
    const errorMsg = hasError ? "Algumas informações de assinaturas não puderam ser carregadas." : undefined;

    return (
        <AssinaturasClient
            initialSubscriptions={assinaturasRes.data || []}
            participantes={participantesRes.data || []}
            streamings={streamingsRes.data || []}
            plano={planoRes.data || "free"}
            kpis={kpisRes.data || { totalAtivas: 0, totalSuspensas: 0, receitaMensalEstimada: 0, totalAssinaturas: 0 }}
            error={errorMsg}
        />
    );
}
