"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { FaturasTable } from "@/components/faturas/FaturasTable";
import { FaturaCard } from "@/components/faturas/FaturaCard";
import { Wallet } from "lucide-react";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { useActionError } from "@/hooks/useActionError";
import { useState } from "react";
import { DetalhesCobrancaModal } from "@/components/modals/DetalhesCobrancaModal";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface FaturasClientProps {
    faturas: any[];
    resumo: any;
    error?: string;
}

export function FaturasClient({ faturas, resumo, error }: FaturasClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useActionError(error);

    const handleViewDetails = (id: number) => {
        const fatura = faturas.find(f => f.id === id);
        setSelectedFatura(fatura);
        setIsDetailsModalOpen(true);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Minhas Faturas"
                description="Veja suas cobranças pendentes e o histórico de pagamentos."
            />

            <div className="space-y-6 mt-8">
                <SectionHeader
                    title="Histórico de Cobranças"
                    className="mb-0"
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
