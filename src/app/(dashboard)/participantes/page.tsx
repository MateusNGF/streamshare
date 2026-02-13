import { getParticipantes } from "@/actions/participantes";
import { ParticipantesClient } from "@/components/participantes/ParticipantesClient";

export default async function ParticipantesPage() {
    const participantes = await getParticipantes();

    return <ParticipantesClient initialData={participantes} />;
}
