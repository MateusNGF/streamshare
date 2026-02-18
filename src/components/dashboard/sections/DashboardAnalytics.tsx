"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { Spinner } from "@/components/ui/Spinner";
import { TrendingUp, LineChart, AlertCircle, Wallet, Sparkles, LayoutPanelLeft, Coins } from "lucide-react";
import { DashboardStats, RevenueHistory } from "@/types/dashboard.types";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { useRouter } from "next/navigation";
import { EmptyChartState } from "../EmptyChartState";
import { SectionHeader } from "@/components/layout/SectionHeader";

const ChartSkeleton = ({ className }: { className?: string }) => (
    <div className={`h-[420px] bg-white rounded-[32px] flex items-center justify-center border border-gray-100 ${className}`}>
        <Spinner />
    </div>
);

const RevenueHistoryChart = dynamic(() => import("../charts/RevenueHistoryChart").then(mod => mod.RevenueHistoryChart), {
    loading: () => <ChartSkeleton className="lg:col-span-2" />,
    ssr: false
});

const OccupancyDistributionChart = dynamic(() => import("../charts/OccupancyDistributionChart").then(mod => mod.OccupancyDistributionChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

const RevenueDistributionChart = dynamic(() => import("../charts/RevenueDistributionChart").then(mod => mod.RevenueDistributionChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

const PaymentStatusChart = dynamic(() => import("../charts/PaymentStatusChart").then(mod => mod.PaymentStatusChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

const ChurnRiskChart = dynamic(() => import("../charts/ChurnRiskChart").then(mod => mod.ChurnRiskChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

interface DistributionItem {
    name: string;
    ocupadas: number;
    vagas: number;
    color: string;
}

interface DashboardAnalyticsProps {
    stats: DashboardStats;
    revenueHistory: RevenueHistory[];
    distributionData: DistributionItem[];
}

export function DashboardAnalytics({ stats, revenueHistory, distributionData }: DashboardAnalyticsProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const { financial, membership, occupancy, payments, churn, catalogs, currencyCode } = stats;

    const formatCurrency = (val: number) => formatarMoeda(val, currencyCode);

    const handleAddStreaming = () => router.push("/streamings");
    const handleManageCobrancas = () => router.push("/cobrancas");
    const handleViewParticipants = () => router.push("/participantes");

    const isDashboardEmpty =
        financial.monthlyRevenue === 0 &&
        membership.activeParticipantsCount === 0 &&
        occupancy.totalSlots === 0;

    return (
        <section>
            <SectionHeader
                title="Analytics & Performance"
                rightElement={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
            />

            {isDashboardEmpty ? (
                <div className="animate-fade-in py-12">
                    <EmptyChartState
                        icon={LayoutPanelLeft}
                        title="Seu dashboard está vazio"
                        description="Adicione seu primeiro streaming para começar a ver métricas e gráficos de performance."
                        actionLabel="Começar agora"
                        onAction={handleAddStreaming}
                    />
                </div>
            ) : viewMode === "grid" ? (
                <div className="">
                    <KPIGrid cols={4} className="mb-6">
                        {[
                            {
                                title: "Receita Estimada",
                                value: formatCurrency(financial.monthlyRevenue),
                                change: `${financial.revenueTrend >= 0 ? '+' : ''}${financial.revenueTrend.toFixed(1)}%`,
                                trend: (financial.revenueTrend >= 0 ? "up" : "down") as "up" | "down",
                                icon: TrendingUp,
                                tooltip: "Soma total dos valores das assinaturas ativas que devem ser pagos este mês."
                            },
                            {
                                title: "Ticket Médio",
                                value: formatCurrency(financial.averageTicket),
                                change: "por participante",
                                trend: "up" as "up" | "down",
                                icon: Coins,
                                tooltip: "Valor médio que cada participante paga. Ajuda a avaliar a saúde financeira individual das assinaturas."
                            },
                            {
                                title: "Taxa de Ocupação",
                                value: `${occupancy.occupationRate.toFixed(1)}%`,
                                change: occupancy.totalSlots > 0 ? `${occupancy.occupiedSlots}/${occupancy.totalSlots} vagas` : "0 vagas",
                                trend: (occupancy.occupationRate > 80 ? "up" : "down") as "up" | "down",
                                icon: LineChart,
                                tooltip: "Percentual de vagas preenchidas. Vagas vazias representam custos que você está cobrindo sozinho."
                            },
                            {
                                title: "Risco de Churn",
                                value: `${churn.riskRate.toFixed(1)}%`,
                                change: "baseado em atrasos",
                                trend: (churn.riskRate < 20 ? "up" : "down") as "up" | "down",
                                icon: AlertCircle,
                                tooltip: "Probabilidade de cancelamento calculada com base em atrasos e falhas de pagamento nos últimos 6 meses."
                            },
                        ].map((card, idx) => (
                            <KPIGridItem key={idx} className="animate-scale-in" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                                <KPICard {...card} />
                            </KPIGridItem>
                        ))}
                    </KPIGrid>

                    {/* Linha 2: KPIs Financeiros & Comparativos - Glass Effect & Staggered */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KPIFinanceiroCard
                            titulo="Saldo Líquido"
                            valor={financial.netBalance}
                            icone={Wallet}
                            cor={financial.netBalance >= 0 ? "green" : "red"}
                            index={0}
                            tooltip="O saldo real no seu bolso após o rateio: é a diferença entre a receita recebida dos participantes e o custo total dos planos. Se positivo, indica lucro; se negativo, indica o seu custo final reduzido."
                        />
                        <KPIFinanceiroCard
                            titulo="Economia Gerada"
                            valor={financial.totalSavings}
                            icone={Sparkles}
                            cor="green"
                            index={1}
                            tooltip="Valor total que você e seus participantes deixaram de pagar ao assinar através do compartilhamento em vez de planos individuais."
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Linha 1: Faturamento & Crescimento - Full Width with Float animation */}
                    <div className="w-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 rounded-[40px]">
                        <RevenueHistoryChart
                            data={revenueHistory}
                            currencyCode={currencyCode}
                            onAddStreaming={handleAddStreaming}
                        />
                    </div>

                    {/* Linha 2: Distribuições e Saúde - Staggered Fade-in */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="animate-slide-in-from-bottom" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <RevenueDistributionChart
                                data={catalogs || []}
                                currencyCode={currencyCode}
                                onViewStreamings={handleAddStreaming}
                            />
                        </div>
                        <div className="animate-slide-in-from-bottom" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                            <OccupancyDistributionChart
                                data={distributionData}
                                onAddStreaming={handleAddStreaming}
                            />
                        </div>
                        <div className="animate-slide-in-from-bottom" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                            <PaymentStatusChart
                                data={payments.paymentStatusData || []}
                                onManageSubscriptions={handleManageCobrancas}
                            />
                        </div>
                        <div className="animate-slide-in-from-bottom" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
                            <ChurnRiskChart
                                data={churn.riskData || []}
                                riskRate={churn.riskRate}
                                onViewParticipants={handleViewParticipants}
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
