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

export default function Home() {
  return (
    <div className="p-8 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 font-medium">Bem-vindo de volta, Carlos!</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-gray-900 shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all">
            <Plus size={20} />
            Novo Streaming
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard
          title="Receita Mensal"
          value="R$ 1.247,80"
          change="+12%"
          trend="up"
          icon={TrendingUp}
        />
        <KPICard
          title="Participantes Ativos"
          value="47"
          change="+5"
          trend="up"
          icon={Users2}
        />
        <KPICard
          title="Taxa de Ocupação"
          value="87%"
          change="+3%"
          trend="up"
          icon={LineChart}
        />
        <KPICard
          title="Inadimplência"
          value="4.2%"
          change="-1.5%"
          trend="down"
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* My Streamings */}
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Meus Streamings</h2>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Ver Todos <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <StreamingCard
              name="Netflix"
              initial="N"
              color="#E50914"
              slots={{ occupied: 4, total: 5 }}
              value="55.90"
            />
            <StreamingCard
              name="Spotify Family"
              initial="S"
              color="#1DB954"
              slots={{ occupied: 6, total: 6 }}
              value="34.90"
            />
            <StreamingCard
              name="Disney+"
              initial="D"
              color="#006E99"
              slots={{ occupied: 1, total: 4 }}
              value="33.90"
            />
          </div>
        </section>

        {/* Recent Subscriptions */}
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Assinaturas Recentes</h2>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Ver Todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <RecentSubscription
              name="Maria Silva"
              streaming="Netflix"
              value="13.97"
              status="Ativa"
            />
            <RecentSubscription
              name="João Santos"
              streaming="Spotify"
              value="8.72"
              status="Ativa"
            />
            <RecentSubscription
              name="Ana Costa"
              streaming="Disney+"
              value="11.30"
              status="Em atraso"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
