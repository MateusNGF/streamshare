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
    const results = await Promise.all([
        getDashboardStats(),
        getRecentSubscriptions(),
        getDashboardStreamings(),
        getRevenueHistory(),
        getParticipantStats(),
        getParticipantSubscriptions(),
    ]);

    const [
        statsRes,
        recentSubRes,
        streamingsRes,
        revenueRes,
        pStatsRes,
        pSubRes
    ] = results;

    const hasError = results.some(r => !r.success);
    const errorMsg = hasError ? "Algumas informações não puderam ser carregadas." : undefined;

    return (
        <PageContainer>
            <PageHeader
                title="Painel do Provedor"
                description="Gestão completa do seu ecossistema de streamings."
            />

            <DashboardClient
                stats={statsRes.data || null}
                recentSubscriptions={recentSubRes.data || []}
                streamings={streamingsRes.data || []}
                revenueHistory={revenueRes.data || []}
                participantStats={pStatsRes.data || null}
                participantSubscriptions={pSubRes.data || []}
                initialView="provider"
                hideSwitcher={true}
                error={errorMsg}
            />
        </PageContainer>
    );
}
