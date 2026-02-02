import {
    Plus,
    Bell,
    ChevronRight,
    TrendingUp,
    Users2,
    LineChart,
    AlertCircle
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { StreamingCard } from "@/components/dashboard/StreamingCard";
import { RecentSubscription } from "@/components/dashboard/RecentSubscription";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDashboardStats, getRecentSubscriptions, getDashboardStreamings } from "@/actions/dashboard";

export default async function DashboardPage() {
    const [stats, recentSubscriptions, streamings] = await Promise.all([
        getDashboardStats(),
        getRecentSubscriptions(),
        getDashboardStreamings(),
    ]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Dashboard"
                description="Bem-vindo de volta!"
                action={
                    <div className="flex items-center gap-4">
                        <button
                            aria-label="Notificações"
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-gray-900 shadow-sm relative touch-manipulation"
                        >
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </div>
                }
            />

            <QuickActions />

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                <KPICard
                    title="Receita Mensal"
                    value={formatCurrency(stats.monthlyRevenue)}
                    change="+0%" // Placeholder for now
                    trend="up"
                    icon={TrendingUp}
                />
                <KPICard
                    title="Participantes Ativos"
                    value={String(stats.activeParticipantsCount)}
                    change="+0" // Placeholder for now
                    trend="up"
                    icon={Users2}
                />
                <KPICard
                    title="Taxa de Ocupação"
                    value={`${stats.occupationRate.toFixed(1)}%`}
                    change="+0%" // Placeholder for now
                    trend="up"
                    icon={LineChart}
                />
                <KPICard
                    title="Inadimplência"
                    value={`${stats.defaultRate.toFixed(1)}%`}
                    change="0%" // Placeholder for now
                    trend="down"
                    icon={AlertCircle}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* My Streamings */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Meus Streamings</h2>
                        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                            Ver Todos <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {streamings.length > 0 ? (
                            streamings.map((s) => (
                                <StreamingCard
                                    key={s.id}
                                    name={s.apelido || s.catalogo.nome}
                                    initial={s.catalogo.nome.charAt(0).toUpperCase()}
                                    color={s.catalogo.corPrimaria}
                                    slots={{ occupied: s._count.assinaturas, total: s.limiteParticipantes }}
                                    value={String(s.valorIntegral)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-4 text-sm">Nenhum streaming cadastrado.</p>
                        )}
                    </div>
                </section>

                {/* Recent Subscriptions */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Assinaturas Recentes</h2>
                        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                            Ver Todas <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {recentSubscriptions.length > 0 ? (
                            recentSubscriptions.map((sub) => (
                                <RecentSubscription
                                    key={sub.id}
                                    name={sub.participante.nome}
                                    streaming={sub.streaming.apelido || sub.streaming.catalogo.nome}
                                    value={String(sub.valor)}
                                    status={sub.status === "ativa" ? "Ativa" : "Em atraso"}
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-4 text-sm">Nenhuma assinatura recente.</p>
                        )}
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
