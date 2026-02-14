"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { FaturasTable } from "@/components/faturas/FaturasTable";
import { FaturaCard } from "@/components/faturas/FaturaCard";
import { KPICard } from "@/components/dashboard/KPICard";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useState, useMemo } from "react";
import { DetalhesCobrancaModal } from "@/components/modals/DetalhesCobrancaModal";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";

interface FaturasClientProps {
    faturas: any[];
    resumo: any;
}

export function FaturasClient({ faturas, resumo }: FaturasClientProps) {
    const { format } = useCurrency();
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleViewDetails = (id: number) => {
        const fatura = faturas.find(f => f.id === id);
        setSelectedFatura(fatura);
        setIsDetailsModalOpen(true);
    };

    const stats = useMemo(() => {
        const pendente = resumo.pendente || { total: 0, count: 0 };
        const atrasado = resumo.atrasado || { total: 0, count: 0 };
        const pago = resumo.pago || { total: 0, count: 0 };

        return {
            totalAPagar: pendente.total + atrasado.total,
            pendentesCount: pendente.count + atrasado.count,
            atrasado,
            pago
        };
    }, [resumo]);

    return (
        <PageContainer>
            <PageHeader
                title="Minhas Faturas"
                description="Veja suas cobranças pendentes e o histórico de pagamentos."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 mt-8">
                <KPICard
                    title="Total a Pagar"
                    value={format(stats.totalAPagar)}
                    change={`${stats.pendentesCount} pendentes`}
                    icon={Wallet}
                    trend="up"
                />
                <KPICard
                    title="Faturas em Atraso"
                    value={format(stats.atrasado.total)}
                    change={`${stats.atrasado.count} atrasadas`}
                    icon={AlertCircle}
                    trend="down"
                />
                <KPICard
                    title="Total Pago"
                    value={format(stats.pago.total)}
                    change={`${stats.pago.count} confirmadas`}
                    icon={CheckCircle}
                    trend="up"
                />
            </div>

            <div className="space-y-6">
                <SectionHeader
                    title="Histórico de Cobranças"
                    rightElement={
                        <ViewModeToggle
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                    }
                />

                {faturas.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-gray-200 shadow-sm">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Wallet className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Nenhuma fatura encontrada</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Quando você participar de uma assinatura, as cobranças aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-4">
                            {faturas.map((fatura) => (
                                <FaturaCard key={fatura.id} fatura={fatura} />
                            ))}
                        </div>
                    ) : (
                        <FaturasTable
                            faturas={faturas}
                            onViewDetails={handleViewDetails}
                        />
                    )
                )}
            </div>

            <DetalhesCobrancaModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                cobranca={selectedFatura}
            />
        </PageContainer>
    );
}
