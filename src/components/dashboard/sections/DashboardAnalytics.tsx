"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { KPICard } from "@/components/dashboard/KPICard";
import { Spinner } from "@/components/ui/Spinner";
import { TrendingUp, Users2, LineChart, AlertCircle } from "lucide-react";

const RevenueHistoryChart = dynamic(() => import("../charts/RevenueHistoryChart").then(mod => mod.RevenueHistoryChart), {
    loading: () => <div className="lg:col-span-2 h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

const OccupancyDistributionChart = dynamic(() => import("../charts/OccupancyDistributionChart").then(mod => mod.OccupancyDistributionChart), {
    loading: () => <div className="h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

interface DashboardAnalyticsProps {
    stats: any;
    revenueHistory: any[];
    distributionData: any[];
}

export function DashboardAnalytics({ stats, revenueHistory, distributionData }: DashboardAnalyticsProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold text-gray-900">Analytics & Performance</h2>
                </div>
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <KPICard
                        title="Receita Estimada"
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: stats.currencyCode || 'BRL' }).format(stats.monthlyRevenue)}
                        change="+12.5%"
                        trend="up"
                        icon={TrendingUp}
                    />
                    <KPICard
                        title="Assinantes Ativos"
                        value={String(stats.activeParticipantsCount)}
                        change="+3"
                        trend="up"
                        icon={Users2}
                    />
                    <KPICard
                        title="Taxa de Ocupação"
                        value={`${stats.occupationRate.toFixed(1)}%`}
                        change={stats.totalSlots > 0 ? `${stats.occupiedSlots}/${stats.totalSlots} vagas` : "0 vagas"}
                        trend={stats.occupationRate > 80 ? "up" : "down"}
                        icon={LineChart}
                    />
                    <KPICard
                        title="Ticket Médio"
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: stats.currencyCode || 'BRL' }).format(stats.averageTicket)}
                        change="por usuário"
                        trend="up"
                        icon={AlertCircle}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RevenueHistoryChart data={revenueHistory} />
                    <OccupancyDistributionChart data={distributionData} />
                </div>
            )}
        </section>
    );
}
