import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { ParticipantesClient } from "@/components/participantes/ParticipantesClient";
import { getContext } from "@/lib/action-context";

export default async function ParticipantesPage() {
    const { contaId } = await getContext();
    const participantes = await getParticipantes();
    const streamings = await getStreamings();

    return <ParticipantesClient initialData={participantes} contaId={contaId} streamings={streamings} />;
}
