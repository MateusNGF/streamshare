import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
    getParticipantStats,
    getParticipantSubscriptions
} from "@/actions/dashboard";
import { ParticipantDashboardClient } from "@/components/dashboard/ParticipantDashboardClient";

export default async function ParticipantDashboardPage() {
    const [
        participantStats,
        participantSubscriptions
    ] = await Promise.all([
        getParticipantStats(),
        getParticipantSubscriptions(),
    ]);

    return (
        <PageContainer>
            <PageHeader
                title="Meu Painel"
                description="Acompanhe suas assinaturas e economias."
            />

            <ParticipantDashboardClient
                stats={participantStats}
                subscriptions={participantSubscriptions}
            />
        </PageContainer>
    );
}
