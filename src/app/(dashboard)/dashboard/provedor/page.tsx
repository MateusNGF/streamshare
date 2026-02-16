import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
    getDashboardStats,
    getRecentSubscriptions,
    getDashboardStreamings,
    getRevenueHistory,
    getParticipantStats,
    getParticipantSubscriptions
} from "@/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function ProviderDashboardPage() {
    const [
        stats,
        recentSubscriptions,
        streamings,
        revenueHistory,
        participantStats,
        participantSubscriptions
    ] = await Promise.all([
        getDashboardStats(),
        getRecentSubscriptions(),
        getDashboardStreamings(),
        getRevenueHistory(),
        getParticipantStats(),
        getParticipantSubscriptions(),
    ]);

    return (
        <PageContainer>
            <PageHeader
                title="Painel do Provedor"
                description="Gestão completa do seu ecossistema de streamings."
            />

            <DashboardClient
                stats={stats}
                recentSubscriptions={recentSubscriptions}
                streamings={streamings}
                revenueHistory={revenueHistory}
                participantStats={participantStats}
                participantSubscriptions={participantSubscriptions}
                initialView="provider"
                hideSwitcher={true}
            />
        </PageContainer>
    );
}
