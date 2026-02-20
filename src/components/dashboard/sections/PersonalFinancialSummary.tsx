"use client";

import { Wallet, Sparkles, Calendar, Receipt } from "lucide-react";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { ParticipantStats } from "@/types/dashboard.types";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { formatarMoeda } from "@/lib/financeiro-utils";

interface PersonalFinancialSummaryProps {
    stats: ParticipantStats;
}

export function PersonalFinancialSummary({ stats }: PersonalFinancialSummaryProps) {
    const { activeSubscriptions, monthlySpending, totalSavings, nextPaymentDate, currencyCode } = stats;

    return (
        <section>
            <SectionHeader title="Resumo Pessoal" />

            <KPIGrid cols={4}>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Economia Acumulada"
                        valor={totalSavings}
                        icone={Sparkles}
                        cor="green"
                        index={3}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Mensalidade Total"
                        valor={monthlySpending}
                        icone={Wallet}
                        cor="primary"
                        index={2}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPICard
                        title="Planos Ativos"
                        value={String(activeSubscriptions)}
                        change="Serviços contratados"
                        trend="up"
                        icon={Receipt}
                        index={0}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPICard
                        title="Próxima Renovação"
                        value={nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : "---"}
                        change={nextPaymentDate ? "Data de cobrança" : "Tudo em dia"}
                        trend="up"
                        icon={Calendar}
                        index={1}
                    />
                </KPIGridItem>
            </KPIGrid>
        </section>
    );
}
