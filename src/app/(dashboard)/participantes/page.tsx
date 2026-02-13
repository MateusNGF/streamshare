import { getParticipantes } from "@/actions/participantes";
import { getPendingInvites } from "@/actions/invites";
import { getPendingRequests } from "@/actions/requests";
import { ParticipantesClient } from "@/components/participantes/ParticipantesClient";
import { getStreamings } from "@/actions/streamings";

export default async function ParticipantesPage() {
    const [participantes, pendingInvites, pendingRequests, streamings] = await Promise.all([
        getParticipantes(),
        getPendingInvites(),
        getPendingRequests(),
        getStreamings()
    ]);

    return (
        <ParticipantesClient
            initialData={participantes}
            pendingInvites={pendingInvites}
            pendingRequests={pendingRequests}
            streamings={streamings}
        />
    );
}
