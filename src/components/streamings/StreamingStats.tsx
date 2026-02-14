"use client";

import { LayoutGrid, Users, TrendingUp, Wallet } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useCurrency } from "@/hooks/useCurrency";

interface StreamingStatsProps {
    streamings: any[];
}

export function StreamingStats({ streamings }: StreamingStatsProps) {
    const { format } = useCurrency();

    const stats = {
        totalServices: streamings.length,
        totalOccupied: streamings.reduce((acc, s) => acc + (s._count?.assinaturas || 0), 0),
        totalSlots: streamings.reduce((acc, s) => acc + (s.limiteParticipantes || 0), 0),
        estimatedRevenue: streamings.reduce((acc, s) => {
            const price = typeof s.valorIntegral === 'string' ? parseFloat(s.valorIntegral) : s.valorIntegral;
            const occupied = s._count?.assinaturas || 0;
            const total = s.limiteParticipantes || 1;
            return acc + (occupied * (price / total));
        }, 0)
    };

    const occupancyRate = stats.totalSlots > 0 ? (stats.totalOccupied / stats.totalSlots) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <KPICard
                title="Total de Serviços"
                value={String(stats.totalServices)}
                change="Ativos"
                icon={LayoutGrid}
                trend="up"
            />
            <KPICard
                title="Vagas Ocupadas"
                value={`${stats.totalOccupied}/${stats.totalSlots}`}
                change={`${occupancyRate.toFixed(0)}% ocupação`}
                icon={Users}
                trend={occupancyRate >= 80 ? "up" : "down"}
            />
            <KPICard
                title="Receita Estimada"
                value={format(stats.estimatedRevenue)}
                change="Mensal"
                icon={Wallet}
                trend="up"
            />
            <KPICard
                title="Taxa de Crescimento"
                value="--%"
                change="Em breve"
                icon={TrendingUp}
                trend="up"
            />
        </div>
    );
}
