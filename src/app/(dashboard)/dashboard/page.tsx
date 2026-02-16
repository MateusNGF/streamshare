import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDashboardStats, getRecentSubscriptions, getDashboardStreamings } from "@/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const [stats, recentSubscriptions, streamings] = await Promise.all([
        getDashboardStats(),
        getRecentSubscriptions(),
        getDashboardStreamings(),
    ]);

    return (
        <PageContainer>
            <PageHeader
                title="Dashboard"
                description="Seu centro de controle de streamings."
            />

            <DashboardClient
                stats={stats}
                recentSubscriptions={recentSubscriptions}
                streamings={streamings}
            />
        </PageContainer>
    );
}
