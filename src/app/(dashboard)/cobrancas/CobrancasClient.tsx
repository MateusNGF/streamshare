"use client";

import { DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { CobrancasTable } from "@/components/cobrancas/CobrancasTable";
import { CobrancasModals } from "@/components/cobrancas/CobrancasModals";

interface CobrancasClientProps {
    kpis: {
        totalPendente: number;
        receitaConfirmada: number;
        emAtraso: number;
        totalCobrancas: number;
    };
    cobrancasIniciais: any[];
    whatsappConfigurado: boolean;
}

export function CobrancasClient({ kpis, cobrancasIniciais, whatsappConfigurado }: CobrancasClientProps) {
    const {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        loading,
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedCobranca,
        filteredCobrancas,
        handleConfirmarPagamento,
        executePaymentConfirmation,
        handleCancelarCobranca,
        confirmCancellation,
        handleEnviarWhatsApp,
        handleClearFilters,
        setSelectedCobrancaId // Added this just in case, though handled by actions
    } = useCobrancasActions(cobrancasIniciais);

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <KPIFinanceiroCard
                    titulo="Total a Receber"
                    valor={kpis.totalPendente}
                    icone={DollarSign}
                    cor="primary"
                    index={0}
                />
                <KPIFinanceiroCard
                    titulo="Receita Confirmada"
                    valor={kpis.receitaConfirmada}
                    icone={CheckCircle}
                    cor="green"
                    index={1}
                />
                <KPIFinanceiroCard
                    titulo="Em Atraso"
                    valor={kpis.emAtraso}
                    icone={AlertCircle}
                    cor="red"
                    index={2}
                />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <GenericFilter
                    filters={[
                        {
                            key: "search",
                            type: "text",
                            placeholder: "Buscar participante...",
                            className: "flex-1 min-w-[200px]"
                        },
                        {
                            key: "status",
                            type: "select",
                            label: "Status",
                            className: "w-full md:w-[200px]",
                            options: [
                                { label: "Pendente", value: "pendente" },
                                { label: "Pago", value: "pago" },
                                { label: "Atrasado", value: "atrasado" },
                                { label: "Cancelado", value: "cancelado" }
                            ]
                        }
                    ]}
                    values={{ search: searchTerm, status: statusFilter }}
                    onChange={(key: string, value: string) => {
                        if (key === "search") setSearchTerm(value);
                        if (key === "status") setStatusFilter(value);
                    }}
                    onClear={handleClearFilters}
                />
            </div>

            <CobrancasTable
                cobrancas={filteredCobrancas}
                onViewDetails={(id) => {
                    setSelectedCobrancaId(id);
                    setDetailsModalOpen(true);
                }}
                onConfirmPayment={handleConfirmarPagamento}
                onSendWhatsApp={handleEnviarWhatsApp}
                onCancel={handleCancelarCobranca}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
            />

            <CobrancasModals
                cancelModalOpen={cancelModalOpen}
                onCloseCancel={() => setCancelModalOpen(false)}
                onConfirmCancel={confirmCancellation}
                confirmPaymentModalOpen={confirmPaymentModalOpen}
                onCloseConfirmPayment={() => setConfirmPaymentModalOpen(false)}
                onConfirmPayment={executePaymentConfirmation}
                detailsModalOpen={detailsModalOpen}
                onCloseDetails={() => {
                    setDetailsModalOpen(false);
                    setSelectedCobrancaId(null);
                }}
                selectedCobranca={selectedCobranca}
                loading={loading}
            />
        </PageContainer>
    );
}
