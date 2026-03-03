import { getStreamings } from "@/actions/streamings";
import { getCurrentPlan } from "@/actions/planos";
import { StreamingsClient } from "@/components/streamings/StreamingsClient";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Serviços | StreamShare",
    description: "Gerencie os serviços de streaming compartilhados na sua conta.",
};

export default async function StreamingsPage() {
    const [res, planoRes] = await Promise.all([
        getStreamings(),
        getCurrentPlan()
    ]);

    const serializedStreamings = (res.data || []).map(s => ({
        ...s,
        valorIntegral: Number(s.valorIntegral)
    }));

    return (
        <StreamingsClient
            initialData={serializedStreamings}
            plano={planoRes.data || "free"}
            serverError={!res.success ? "Falha ao carregar streamings." : undefined}
        />
    );
}
