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
import { getPendingLotesCount } from "@/actions/cobrancas";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Painel do Provedor | StreamShare",
    description: "Gerencie seus streamings e grupos de assinaturas e acompanhe seus ganhos.",
};

export default async function ProviderDashboardPage() {
    const results = await Promise.all([
        getDashboardStats(),
        getRecentSubscriptions(),
        getDashboardStreamings(),
        getRevenueHistory(),
        getParticipantStats(),
        getParticipantSubscriptions(),
        getPendingLotesCount(),
    ]);

    const [
        statsRes,
        recentSubRes,
        streamingsRes,
        revenueRes,
        pStatsRes,
        pSubRes,
        pendingLotesRes
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
                pendingLotesCount={pendingLotesRes.data || 0}
                initialView="provider"
                hideSwitcher={true}
                error={errorMsg}
            />
        </PageContainer>
    );
}
