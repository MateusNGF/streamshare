
import { getAssinaturas } from "@/actions/assinaturas";
import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import AssinaturasClient from "./AssinaturasClient";

export default async function AssinaturasPage() {
    const [assinaturas, participantes, streamings] = await Promise.all([
        getAssinaturas(),
        getParticipantes(),
        getStreamings()
    ]);

    return (
        <AssinaturasClient
            initialSubscriptions={assinaturas}
            participantes={participantes}
            streamings={streamings}
        />
    );
}
