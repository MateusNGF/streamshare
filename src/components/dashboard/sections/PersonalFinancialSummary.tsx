"use client";

import { Wallet, Sparkles, Calendar, Receipt } from "lucide-react";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { KPICard } from "@/components/dashboard/KPICard";
import { ParticipantStats } from "@/types/dashboard.types";
import { formatarMoeda } from "@/lib/financeiro-utils";

interface PersonalFinancialSummaryProps {
    stats: ParticipantStats;
}

export function PersonalFinancialSummary({ stats }: PersonalFinancialSummaryProps) {
    const { activeSubscriptions, monthlySpending, totalSavings, nextPaymentDate, currencyCode } = stats;

    const formatCurrency = (val: number) => formatarMoeda(val, currencyCode);

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">Resumo Pessoal</h2>
            </div>

            <div className="relative group">
                <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 scrollbar-hide snap-x snap-mandatory items-stretch py-10 px-4 -mx-4">
                    <div className="min-w-[280px] md:min-w-0 snap-center flex flex-col">
                        <KPICard
                            title="Planos Ativos"
                            value={String(activeSubscriptions)}
                            change="Serviços contratados"
                            trend="up"
                            icon={Receipt}
                            index={0}
                        />
                    </div>
                    <div className="min-w-[280px] md:min-w-0 snap-center flex flex-col">
                        <KPICard
                            title="Próxima Renovação"
                            value={nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : "---"}
                            change={nextPaymentDate ? "Data de cobrança" : "Tudo em dia"}
                            trend="up"
                            icon={Calendar}
                            index={1}
                        />
                    </div>
                    <div className="min-w-[280px] md:min-w-0 snap-center lg:col-span-1 flex flex-col">
                        <KPIFinanceiroCard
                            titulo="Mensalidade Total"
                            valor={monthlySpending}
                            icone={Wallet}
                            cor="primary"
                            index={2}
                        />
                    </div>
                    <div className="min-w-[280px] md:min-w-0 snap-center lg:col-span-1 flex flex-col">
                        <KPIFinanceiroCard
                            titulo="Economia Acumulada"
                            valor={totalSavings}
                            icone={Sparkles}
                            cor="green"
                            index={3}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
