import { getParticipantes } from "@/actions/participantes";
import { getPendingInvites } from "@/actions/invites";
import { getPendingRequests } from "@/actions/requests";
import { ParticipantesClient } from "@/components/participantes/ParticipantesClient";
import { getStreamings } from "@/actions/streamings";

export default async function ParticipantesPage() {
    const results = await Promise.all([
        getParticipantes(),
        getPendingInvites(),
        getPendingRequests(),
        getStreamings()
    ]);

    const [participantesRes, pendingInvitesRes, pendingRequestsRes, streamingsRes] = results;

    const hasError = results.some(r => !r.success);
    const errorMsg = hasError ? "Algumas informações de participantes não puderam ser carregadas." : undefined;

    return (
        <ParticipantesClient
            initialData={participantesRes.data || []}
            pendingInvites={pendingInvitesRes.data || []}
            pendingRequests={pendingRequestsRes.data || []}
            streamings={streamingsRes.data || []}
            error={errorMsg}
        />
    );
}
