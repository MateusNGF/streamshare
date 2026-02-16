"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { Spinner } from "@/components/ui/Spinner";
import { TrendingUp, Users2, LineChart, AlertCircle, Wallet, Receipt, Sparkles } from "lucide-react";
import { DashboardStats, RevenueHistory } from "@/types/dashboard.types";
import { formatarMoeda } from "@/lib/financeiro-utils";

const RevenueHistoryChart = dynamic(() => import("../charts/RevenueHistoryChart").then(mod => mod.RevenueHistoryChart), {
    loading: () => <div className="lg:col-span-2 h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

const OccupancyDistributionChart = dynamic(() => import("../charts/OccupancyDistributionChart").then(mod => mod.OccupancyDistributionChart), {
    loading: () => <div className="h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

const RevenueDistributionChart = dynamic(() => import("../charts/RevenueDistributionChart").then(mod => mod.RevenueDistributionChart), {
    loading: () => <div className="h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

const PaymentStatusChart = dynamic(() => import("../charts/PaymentStatusChart").then(mod => mod.PaymentStatusChart), {
    loading: () => <div className="h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100"><Spinner /></div>,
    ssr: false
});

interface DashboardAnalyticsProps {
    stats: DashboardStats;
    revenueHistory: RevenueHistory[];
    distributionData: any[]; // Mantido como any por enquanto para simplificar o distributionData local
}

export function DashboardAnalytics({ stats, revenueHistory, distributionData }: DashboardAnalyticsProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const { financial, membership, occupancy, payments, catalogs, currencyCode } = stats;

    const formatCurrency = (val: number) => formatarMoeda(val, currencyCode);

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
                <div className="space-y-6">
                    {/* Linha 1: KPIs de Operação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <KPICard
                            title="Receita Estimada"
                            value={formatCurrency(financial.monthlyRevenue)}
                            change={`${financial.revenueTrend >= 0 ? '+' : ''}${financial.revenueTrend.toFixed(1)}%`}
                            trend={financial.revenueTrend >= 0 ? "up" : "down"}
                            icon={TrendingUp}
                        />
                        <KPICard
                            title="Assinantes Ativos"
                            value={String(membership.activeParticipantsCount)}
                            change={`${membership.participantsTrend >= 0 ? '+' : ''}${membership.participantsTrend}`}
                            trend={membership.participantsTrend >= 0 ? "up" : "down"}
                            icon={Users2}
                        />
                        <KPICard
                            title="Taxa de Ocupação"
                            value={`${occupancy.occupationRate.toFixed(1)}%`}
                            change={occupancy.totalSlots > 0 ? `${occupancy.occupiedSlots}/${occupancy.totalSlots} vagas` : "0 vagas"}
                            trend={occupancy.occupationRate > 80 ? "up" : "down"}
                            icon={LineChart}
                        />
                        <KPICard
                            title="Ticket Médio"
                            value={formatCurrency(financial.averageTicket)}
                            change="por usuário"
                            trend="up"
                            icon={AlertCircle}
                        />
                    </div>

                    {/* Linha 2: KPIs Financeiros & Comparativos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPIFinanceiroCard
                            titulo="Saldo Líquido"
                            valor={financial.netBalance}
                            icone={Wallet}
                            cor={financial.netBalance >= 0 ? "green" : "red"}
                            index={0}
                        />
                        <KPIFinanceiroCard
                            titulo="Custo Original (Total)"
                            valor={financial.totalMarketCost}
                            icone={Receipt}
                            cor="primary"
                            index={1}
                        />
                        <KPIFinanceiroCard
                            titulo="Economia do Grupo"
                            valor={financial.totalSavings}
                            icone={Sparkles}
                            cor="green"
                            index={2}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Linha 1: Faturamento & Crescimento (100% largura) */}
                    <div className="w-full">
                        <RevenueHistoryChart data={revenueHistory} currencyCode={currencyCode} />
                    </div>

                    {/* Linha 2: Distribuições e Saúde */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <RevenueDistributionChart data={catalogs || []} currencyCode={currencyCode} />
                        <OccupancyDistributionChart data={distributionData} />
                        <PaymentStatusChart data={payments.paymentStatusData || []} />
                    </div>
                </div>
            )}
        </section>
    );
}
